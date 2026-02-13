"use client";

import {
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	Textarea,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { AssigneeSelect } from "./AssigneeSelect";
import { PRIORITY_CONFIG } from "../lib/constants";

interface TaskFormValues {
	title: string;
	description?: string | null;
	priority: "low" | "medium" | "high" | "urgent";
	assigneeId?: string | null;
	columnId: string;
}

interface TaskFormFieldsProps {
	form: UseFormReturn<TaskFormValues>;
	columns: { id: string; title: string }[];
	autoFocusTitle?: boolean;
}

export function TaskFormFields({
	form,
	columns,
	autoFocusTitle,
}: TaskFormFieldsProps) {
	const t = useTranslations();

	const watchedPriority = form.watch("priority");
	const watchedColumnId = form.watch("columnId");
	const watchedAssigneeId = form.watch("assigneeId");

	const priorityLabel =
		t(`boards.task.priorities.${watchedPriority}`) ?? watchedPriority;
	const columnLabel =
		columns.find((c) => c.id === watchedColumnId)?.title ?? "";

	return (
		<>
			<div className="space-y-2">
				<Label htmlFor="task-title">
					{t("boards.task.create.titleLabel")}
				</Label>
				<Input
					id="task-title"
					placeholder={t("boards.task.create.titlePlaceholder")}
					{...form.register("title")}
					autoFocus={autoFocusTitle}
				/>
				{form.formState.errors.title && (
					<p className="text-sm text-destructive">
						{form.formState.errors.title.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="task-description">
					{t("boards.task.create.descriptionLabel")}
				</Label>
				<Textarea
					id="task-description"
					placeholder={t(
						"boards.task.create.descriptionPlaceholder",
					)}
					{...form.register("description")}
					rows={3}
				/>
			</div>

			<div className="space-y-2">
				<Label>{t("boards.task.create.priorityLabel")}</Label>
				<Select
					value={watchedPriority}
					onValueChange={(v) =>
						form.setValue(
							"priority",
							v as TaskFormValues["priority"],
						)
					}
				>
					<SelectTrigger className="w-full">
						<span data-slot="select-value" className="flex flex-1 items-center text-left">
							{priorityLabel}
						</span>
					</SelectTrigger>
					<SelectContent>
						{(
							Object.keys(PRIORITY_CONFIG) as Array<
								keyof typeof PRIORITY_CONFIG
							>
						).map((priority) => (
							<SelectItem key={priority} value={priority}>
								{t(`boards.task.priorities.${priority}`)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label>{t("boards.task.create.columnLabel")}</Label>
				<Select
					value={watchedColumnId}
					onValueChange={(v) => form.setValue("columnId", v)}
				>
					<SelectTrigger className="w-full">
						<span data-slot="select-value" className="flex flex-1 items-center text-left">
							{columnLabel}
						</span>
					</SelectTrigger>
					<SelectContent>
						{columns.map((col) => (
							<SelectItem key={col.id} value={col.id}>
								{col.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label>{t("boards.task.create.assigneeLabel")}</Label>
				<AssigneeSelect
					value={watchedAssigneeId ?? null}
					onChange={(v) =>
						form.setValue("assigneeId", v ?? undefined)
					}
				/>
			</div>
		</>
	);
}

export type { TaskFormValues };
