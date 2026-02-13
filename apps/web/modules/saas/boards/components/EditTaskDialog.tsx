"use client";

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { orpc } from "@shared/lib/orpc-query-utils";
import { zodResolver } from "@shared/lib/zod-form-resolver";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TaskFormFields, type TaskFormValues } from "./TaskFormFields";

const formSchema = z.object({
	title: z.string().min(1).max(200),
	description: z.string().max(2000).nullable().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]),
	assigneeId: z.string().nullable().optional(),
	columnId: z.string(),
});

interface TaskData {
	id: string;
	title: string;
	description: string | null;
	priority: string;
	assigneeId: string | null;
	columnId: string;
}

interface EditTaskDialogProps {
	task: TaskData | null;
	boardId: string;
	columns: { id: string; title: string }[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({
	task,
	boardId,
	columns,
	open,
	onOpenChange,
}: EditTaskDialogProps) {
	const t = useTranslations();
	const queryClient = useQueryClient();

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(formSchema),
		values: task
			? {
					title: task.title,
					description: task.description,
					priority: task.priority as TaskFormValues["priority"],
					assigneeId: task.assigneeId,
					columnId: task.columnId,
				}
			: {
					title: "",
					description: null,
					priority: "medium",
					assigneeId: null,
					columnId: columns[0]?.id ?? "",
				},
	});

	const updateMutation = useMutation({
		...orpc.boards.tasks.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(
				orpc.boards.get.queryOptions({ input: { id: boardId } }),
			);
			toastSuccess(t("boards.task.update.notifications.success"));
			onOpenChange(false);
		},
		onError: () => {
			toastError(t("boards.task.update.notifications.error"));
		},
	});

	function onSubmit(values: TaskFormValues) {
		if (!task) return;
		updateMutation.mutate({
			id: task.id,
			title: values.title,
			description: values.description,
			priority: values.priority,
			assigneeId: values.assigneeId,
			columnId: values.columnId,
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("boards.task.edit.title")}</DialogTitle>
					<DialogDescription>
						{t("boards.task.edit.subtitle")}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<TaskFormFields form={form} columns={columns} />

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							{t("common.confirmation.cancel")}
						</Button>
						<Button
							type="submit"
							disabled={updateMutation.isPending}
						>
							{t("boards.task.edit.submit")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
