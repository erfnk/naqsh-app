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
import { useEffect } from "react";
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

interface CreateTaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	boardId: string;
	columns: { id: string; title: string }[];
	defaultColumnId: string;
}

export function CreateTaskDialog({
	open,
	onOpenChange,
	boardId,
	columns,
	defaultColumnId,
}: CreateTaskDialogProps) {
	const t = useTranslations();
	const queryClient = useQueryClient();

	const form = useForm<TaskFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: undefined,
			priority: "low",
			assigneeId: undefined,
			columnId: defaultColumnId,
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				title: "",
				description: undefined,
				priority: "low",
				assigneeId: undefined,
				columnId: defaultColumnId,
			});
		}
	}, [open, defaultColumnId, form.reset]);

	const createMutation = useMutation(
		orpc.boards.tasks.create.mutationOptions(),
	);

	async function onSubmit(values: TaskFormValues) {
		try {
			await createMutation.mutateAsync({
				boardId,
				columnId: values.columnId,
				title: values.title,
				description: values.description ?? undefined,
				priority: values.priority,
				assigneeId: values.assigneeId ?? undefined,
			});

			await queryClient.invalidateQueries(
				orpc.boards.get.queryOptions({ input: { id: boardId } }),
			);

			toastSuccess(t("boards.task.create.notifications.success"));
			form.reset();
			onOpenChange(false);
		} catch {
			toastError(t("boards.task.create.notifications.error"));
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("boards.task.create.title")}</DialogTitle>
					<DialogDescription>
						{t("boards.task.create.subtitle")}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<TaskFormFields
						form={form}
						columns={columns}
						autoFocusTitle
					/>

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
							disabled={createMutation.isPending}
						>
							{t("boards.task.create.submit")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
