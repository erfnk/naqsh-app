"use client";

import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { useSession } from "@saas/auth/hooks/use-session";
import { UserAvatar } from "@shared/components/UserAvatar";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Edit02Icon,
	Delete01Icon,
	SentIcon,
} from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface TaskCommentsSectionProps {
	taskId: string;
	boardId: string;
	canComment: boolean;
}

export function TaskCommentsSection({
	taskId,
	boardId,
	canComment,
}: TaskCommentsSectionProps) {
	const t = useTranslations();
	const { user } = useSession();
	const queryClient = useQueryClient();
	const [newComment, setNewComment] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editContent, setEditContent] = useState("");

	const commentsQueryOptions = orpc.boards.tasks.comments.list.queryOptions({
		input: { taskId, boardId },
	});

	const { data: comments = [], isLoading } = useQuery({
		...commentsQueryOptions,
		refetchInterval: 10_000,
	});

	const createMutation = useMutation({
		...orpc.boards.tasks.comments.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(commentsQueryOptions);
			setNewComment("");
			toastSuccess(
				t("boards.task.comments.notifications.createSuccess"),
			);
		},
		onError: () => {
			toastError(t("boards.task.comments.notifications.createError"));
		},
	});

	const updateMutation = useMutation({
		...orpc.boards.tasks.comments.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(commentsQueryOptions);
			setEditingId(null);
			setEditContent("");
			toastSuccess(
				t("boards.task.comments.notifications.updateSuccess"),
			);
		},
		onError: () => {
			toastError(t("boards.task.comments.notifications.updateError"));
		},
	});

	const deleteMutation = useMutation({
		...orpc.boards.tasks.comments.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(commentsQueryOptions);
			toastSuccess(
				t("boards.task.comments.notifications.deleteSuccess"),
			);
		},
		onError: () => {
			toastError(t("boards.task.comments.notifications.deleteError"));
		},
	});

	function handleSubmit() {
		const trimmed = newComment.trim();
		if (!trimmed) return;
		createMutation.mutate({ taskId, boardId, content: trimmed });
	}

	function handleUpdate(id: string) {
		const trimmed = editContent.trim();
		if (!trimmed) return;
		updateMutation.mutate({ id, content: trimmed });
	}

	function handleDelete(id: string) {
		deleteMutation.mutate({ id, boardId });
	}

	function startEditing(id: string, content: string) {
		setEditingId(id);
		setEditContent(content);
	}

	function cancelEditing() {
		setEditingId(null);
		setEditContent("");
	}

	function formatTime(date: string | Date) {
		return new Date(date).toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	return (
		<div className="space-y-3">
			<h4 className="text-sm font-medium">
				{t("boards.task.comments.title")}
			</h4>

			{isLoading ? (
				<div className="flex items-center justify-center py-4">
					<div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
				</div>
			) : comments.length === 0 ? (
				<p className="text-sm text-muted-foreground py-2">
					{t("boards.task.comments.empty")}
				</p>
			) : (
				<div className="space-y-3 max-h-60 overflow-y-auto">
					{comments.map((comment) => (
						<div key={comment.id} className="flex gap-2">
							<UserAvatar
								name={
									comment.author.name ??
									comment.author.email
								}
								avatarUrl={comment.author.image}
								className="size-7 shrink-0"
							/>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium truncate">
										{comment.author.name}
									</span>
									<span className="text-xs text-muted-foreground shrink-0">
										{formatTime(comment.createdAt)}
									</span>
									{comment.authorId === user?.id && (
										<div className="ml-auto flex items-center gap-1 shrink-0">
											<button
												type="button"
												onClick={() =>
													startEditing(
														comment.id,
														comment.content,
													)
												}
												className="text-muted-foreground hover:text-foreground p-0.5"
											>
												<HugeiconsIcon
													icon={Edit02Icon}
													className="size-3"
													strokeWidth={2}
												/>
											</button>
											<button
												type="button"
												onClick={() =>
													handleDelete(comment.id)
												}
												className="text-muted-foreground hover:text-destructive p-0.5"
											>
												<HugeiconsIcon
													icon={Delete01Icon}
													className="size-3"
													strokeWidth={2}
												/>
											</button>
										</div>
									)}
								</div>
								{editingId === comment.id ? (
									<div className="mt-1 space-y-1">
										<Textarea
											value={editContent}
											onChange={(e) =>
												setEditContent(e.target.value)
											}
											className="min-h-[60px] text-sm"
										/>
										<div className="flex gap-1">
											<Button
												size="sm"
												variant="ghost"
												onClick={cancelEditing}
											>
												{t(
													"common.confirmation.cancel",
												)}
											</Button>
											<Button
												size="sm"
												onClick={() =>
													handleUpdate(comment.id)
												}
												disabled={
													updateMutation.isPending
												}
											>
												{t(
													"boards.task.comments.submit",
												)}
											</Button>
										</div>
									</div>
								) : (
									<p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
										{comment.content}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{canComment && (
				<div className="flex gap-2">
					<Textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder={t("boards.task.comments.placeholder")}
						className="min-h-[60px] text-sm flex-1"
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								e.preventDefault();
								handleSubmit();
							}
						}}
					/>
					<Button
						size="icon"
						onClick={handleSubmit}
						disabled={
							!newComment.trim() || createMutation.isPending
						}
						className="shrink-0 self-end"
					>
						<HugeiconsIcon
							icon={SentIcon}
							className="size-4"
							strokeWidth={2}
						/>
					</Button>
				</div>
			)}
		</div>
	);
}
