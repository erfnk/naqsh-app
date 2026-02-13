"use client";

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Textarea,
} from "@repo/ui";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@shared/lib/zod-form-resolver";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { toastError, toastSuccess } from "@repo/ui/components/toast";

const formSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateBoardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateBoardDialog({
	open,
	onOpenChange,
}: CreateBoardDialogProps) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { activeOrganization } = useActiveOrganization();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { title: "", description: "" },
	});

	const createMutation = useMutation(
		orpc.boards.create.mutationOptions(),
	);

	async function onSubmit(values: FormValues) {
		if (!activeOrganization) return;

		try {
			const board = await createMutation.mutateAsync({
				...values,
				organizationId: activeOrganization.id,
			});

			await queryClient.invalidateQueries({
				queryKey: orpc.boards.list.key(),
			});

			toastSuccess(t("boards.create.notifications.success"));
			reset();
			onOpenChange(false);
			router.push(`/app/${activeOrganization.slug}/boards/${board.slug ?? board.id}`);
		} catch {
			toastError(t("boards.create.notifications.error"));
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("boards.create.title")}</DialogTitle>
					<DialogDescription>
						{t("boards.empty.description")}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">{t("boards.create.name")}</Label>
						<Input
							id="title"
							placeholder={t("boards.create.namePlaceholder")}
							{...register("title")}
							autoFocus
						/>
						{errors.title && (
							<p className="text-sm text-destructive">
								{errors.title.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">
							{t("boards.create.description")}
						</Label>
						<Textarea
							id="description"
							placeholder={t("boards.create.descriptionPlaceholder")}
							{...register("description")}
							rows={3}
						/>
					</div>

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
							{t("boards.create.submit")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
