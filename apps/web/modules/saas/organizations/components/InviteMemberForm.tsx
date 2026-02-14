"use client";

import { zodResolver } from "@shared/lib/zod-form-resolver";
import type { OrganizationMemberRole } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { getAssignableRoles } from "@repo/auth/lib/roles";
import { Button } from "@repo/ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { toastError, toastSuccess } from "@repo/ui/components/toast";
import { OrganizationRoleSelect } from "@saas/organizations/components/OrganizationRoleSelect";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { fullOrganizationQueryKey } from "@saas/organizations/lib/api";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	email: z.email(),
	role: z.enum(["member", "owner", "admin"]),
});

export function InviteMemberForm({
	organizationId,
}: {
	organizationId: string;
}) {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { activeOrganizationUserRole } = useActiveOrganization();
	const assignableRoles = getAssignableRoles(
		activeOrganizationUserRole ?? "member",
	) as OrganizationMemberRole[];

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			role: "member" as z.infer<typeof formSchema>["role"],
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		try {
			const { error } = await authClient.organization.inviteMember({
				...values,
				organizationId,
			});

			if (error) {
				throw error;
			}

			form.reset();

			queryClient.invalidateQueries({
				queryKey: fullOrganizationQueryKey(organizationId),
			});

			toastSuccess(
				t(
					"organizations.settings.members.inviteMember.notifications.success.title",
				),
			);
		} catch {
			toastError(
				t(
					"organizations.settings.members.inviteMember.notifications.error.title",
				),
			);
		}
	});

	return (
		<SettingsItem
			title={t("organizations.settings.members.inviteMember.title")}
			description={t(
				"organizations.settings.members.inviteMember.description",
			)}
		>
			<Form {...form}>
				<form onSubmit={onSubmit} className="@container">
					<div className="flex @md:flex-row flex-col gap-2">
						<div className="flex-1">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t(
												"organizations.settings.members.inviteMember.email",
											)}
										</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<div>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t(
												"organizations.settings.members.inviteMember.role",
											)}
										</FormLabel>
										<FormControl>
											<OrganizationRoleSelect
												value={field.value}
												onSelect={field.onChange}
												allowedRoles={assignableRoles}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
					</div>

					<div className="mt-4 flex justify-end">
						<Button
							type="submit"
							loading={form.formState.isSubmitting}
						>
							{t(
								"organizations.settings.members.inviteMember.submit",
							)}
						</Button>
					</div>
				</form>
			</Form>
		</SettingsItem>
	);
}
