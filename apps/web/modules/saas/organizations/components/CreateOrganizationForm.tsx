"use client";

import { zodResolver } from "@shared/lib/zod-form-resolver";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Field,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { toastError } from "@repo/ui/components/toast";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import {
	organizationListQueryKey,
	useCreateOrganizationMutation,
} from "@saas/organizations/lib/api";
import { useRouter } from "@shared/hooks/router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3).max(32),
});

export function CreateOrganizationForm({
	defaultName,
}: {
	defaultName?: string;
}) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { setActiveOrganization } = useActiveOrganization();
	const createOrganizationMutation = useCreateOrganizationMutation();
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: defaultName ?? "",
		},
	});

	const onSubmit = form.handleSubmit(async ({ name }) => {
		try {
			const newOrganization =
				await createOrganizationMutation.mutateAsync({
					name,
				});

			if (!newOrganization) {
				throw new Error("Failed to create organization");
			}

			await setActiveOrganization(newOrganization.slug);

			await queryClient.invalidateQueries({
				queryKey: organizationListQueryKey,
			});

			router.replace(`/app/${newOrganization.slug}`);
		} catch {
			toastError(t("organizations.createForm.notifications.error"));
		}
	});

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle>{t("organizations.createForm.title")}</CardTitle>
				<CardDescription>
					{t("organizations.createForm.subtitle")}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={onSubmit}>
						<FieldGroup>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<Field>
											<FieldLabel htmlFor="name">
												{t("organizations.createForm.name")}
											</FieldLabel>
											<FormControl>
												<Input
													id="name"
													{...field}
													autoComplete="organization"
												/>
											</FormControl>
										</Field>
									</FormItem>
								)}
							/>

							<Field>
								<Button
									className="w-full"
									type="submit"
									loading={form.formState.isSubmitting}
								>
									{t("organizations.createForm.submit")}
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
