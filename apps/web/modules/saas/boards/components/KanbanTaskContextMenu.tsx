"use client";

import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "@repo/ui";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";
import { PRIORITY_CONFIG } from "../lib/constants";

interface ColumnData {
	id: string;
	title: string;
}

interface KanbanTaskContextMenuProps {
	taskId: string;
	boardId: string;
	currentColumnId: string;
	columns: ColumnData[];
	onEdit: () => void;
}

export function KanbanTaskContextMenu({
	taskId,
	boardId,
	currentColumnId,
	columns,
	onEdit,
	children,
}: PropsWithChildren<KanbanTaskContextMenuProps>) {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { confirm } = useConfirmationAlert();

	const boardQueryOptions = orpc.boards.get.queryOptions({
		input: { id: boardId },
	});

	const updateMutation = useMutation({
		...orpc.boards.tasks.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(boardQueryOptions);
		},
		onError: () => {
			toastError(t("boards.task.update.notifications.error"));
		},
	});

	const deleteMutation = useMutation({
		...orpc.boards.tasks.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(boardQueryOptions);
			toastSuccess(t("boards.task.delete.notifications.success"));
		},
		onError: () => {
			toastError(t("boards.task.delete.notifications.error"));
		},
	});

	const moveMutation = useMutation({
		...orpc.boards.tasks.move.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(boardQueryOptions);
		},
		onError: () => {
			toastError(t("boards.task.update.notifications.error"));
		},
	});

	const otherColumns = columns.filter((c) => c.id !== currentColumnId);

	return (
		<ContextMenu>
			<ContextMenuTrigger>{children}</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={onEdit}>
					{t("boards.task.contextMenu.edit")}
				</ContextMenuItem>

				<ContextMenuSub>
					<ContextMenuSubTrigger>
						{t("boards.task.contextMenu.changePriority")}
					</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						{(
							Object.keys(PRIORITY_CONFIG) as Array<
								keyof typeof PRIORITY_CONFIG
							>
						).map((priority) => (
							<ContextMenuItem
								key={priority}
								onClick={() =>
									updateMutation.mutate({
										id: taskId,
										priority,
									})
								}
							>
								{t(`boards.task.priorities.${priority}`)}
							</ContextMenuItem>
						))}
					</ContextMenuSubContent>
				</ContextMenuSub>

				{otherColumns.length > 0 && (
					<ContextMenuSub>
						<ContextMenuSubTrigger>
							{t("boards.task.contextMenu.moveToColumn")}
						</ContextMenuSubTrigger>
						<ContextMenuSubContent>
							{otherColumns.map((column) => (
								<ContextMenuItem
									key={column.id}
									onClick={() =>
										moveMutation.mutate({
											taskId,
											targetColumnId: column.id,
											position: 0,
										})
									}
								>
									{column.title}
								</ContextMenuItem>
							))}
						</ContextMenuSubContent>
					</ContextMenuSub>
				)}

				<ContextMenuSeparator />

				<ContextMenuItem
					variant="destructive"
					onClick={() =>
						confirm({
							title: t("boards.task.delete.confirmTitle"),
							message: t("boards.task.delete.confirmMessage"),
							destructive: true,
							onConfirm: async () => {
								await deleteMutation.mutateAsync({ id: taskId });
							},
						})
					}
				>
					{t("boards.task.contextMenu.delete")}
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
