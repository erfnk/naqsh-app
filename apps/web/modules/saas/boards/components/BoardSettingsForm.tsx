"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
	Input,
	Label,
	Switch,
	Textarea,
} from "@repo/ui";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { useRouter } from "@shared/hooks/router";
import { orpc } from "@shared/lib/orpc-query-utils";
import { zodResolver } from "@shared/lib/zod-form-resolver";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const boardSettingsSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().max(500).nullable(),
	visibility: z.enum(["private", "public"]),
});

type BoardSettingsValues = z.infer<typeof boardSettingsSchema>;

interface BoardData {
	id: string;
	title: string;
	description: string | null;
	visibility: string;
}

interface BoardSettingsFormProps {
	board: BoardData;
	organizationSlug: string;
}

export function BoardSettingsForm({
	board,
	organizationSlug,
}: BoardSettingsFormProps) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();

	const form = useForm<BoardSettingsValues>({
		resolver: zodResolver(boardSettingsSchema),
		defaultValues: {
			title: board.title,
			description: board.description,
			visibility: board.visibility as BoardSettingsValues["visibility"],
		},
	});

	const updateMutation = useMutation({
		...orpc.boards.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(
				orpc.boards.get.queryOptions({ input: { id: board.id } }),
			);
			queryClient.invalidateQueries({ queryKey: orpc.boards.list.key() });
			toastSuccess(t("boards.settings.notifications.updateSuccess"));
		},
		onError: () => {
			toastError(t("boards.settings.notifications.updateError"));
		},
	});

	const deleteMutation = useMutation({
		...orpc.boards.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.boards.list.key() });
			toastSuccess(t("boards.settings.notifications.deleteSuccess"));
			router.push(`/app/${organizationSlug}`);
		},
		onError: () => {
			toastError(t("boards.settings.notifications.deleteError"));
		},
	});

	const onSubmit = form.handleSubmit((values) => {
		updateMutation.mutate({
			id: board.id,
			...values,
		});
	});

	return (
		<div className="flex flex-col gap-4">
			<SettingsItem title={t("boards.settings.name")}>
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<div className="space-y-2">
						<Label>{t("boards.settings.name")}</Label>
						<Input {...form.register("title")} />
					</div>

					<div className="space-y-2">
						<Label>{t("boards.settings.description")}</Label>
						<Textarea {...form.register("description")} rows={3} />
					</div>

					<div className="flex items-center justify-between gap-4">
						<div className="space-y-1">
							<Label>{t("boards.settings.visibility")}</Label>
							<p className="text-muted-foreground text-xs">
								{t("boards.settings.visibilityDescription")}
							</p>
						</div>
						<Switch
							checked={form.watch("visibility") === "public"}
							onCheckedChange={(checked) =>
								form.setValue(
									"visibility",
									checked ? "public" : "private",
								)
							}
						/>
					</div>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={!form.formState.isDirty}
							loading={updateMutation.isPending}
						>
							{t("boards.settings.save")}
						</Button>
					</div>
				</form>
			</SettingsItem>

			<SettingsItem
				title={t("boards.settings.delete.title")}
				description={t("boards.settings.delete.description")}
				danger
			>
				<div className="flex items-start">
					<AlertDialog>
						<AlertDialogTrigger
							render={<Button variant="destructive" />}
						>
							{t("boards.settings.delete.submit")}
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									{t("boards.settings.delete.title")}
								</AlertDialogTitle>
								<AlertDialogDescription>
									{t("boards.settings.delete.confirm")}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>
									{t("common.confirmation.cancel")}
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={() =>
										deleteMutation.mutate({
											id: board.id,
										})
									}
								>
									{t("boards.settings.delete.submit")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</SettingsItem>
		</div>
	);
}
