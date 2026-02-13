"use client";

import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldGroup } from "@repo/ui/components/field";
import { toastError } from "@repo/ui/components/toast";
import { OrganizationLogo } from "@saas/organizations/components/OrganizationLogo";
import { organizationListQueryKey } from "@saas/organizations/lib/api";
import { useRouter } from "@shared/hooks/router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function OrganizationInvitationModal({
	invitationId,
	organizationName,
	organizationSlug,
	logoUrl,
}: {
	invitationId: string;
	organizationName: string;
	organizationSlug: string;
	logoUrl?: string;
}) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [submitting, setSubmitting] = useState<false | "accept" | "reject">(
		false,
	);

	const onSelectAnswer = async (accept: boolean) => {
		setSubmitting(accept ? "accept" : "reject");
		try {
			if (accept) {
				const { error } =
					await authClient.organization.acceptInvitation({
						invitationId,
					});

				if (error) {
					throw error;
				}

				await queryClient.invalidateQueries({
					queryKey: organizationListQueryKey,
				});

				router.replace(`/app/${organizationSlug}`);
			} else {
				const { error } =
					await authClient.organization.rejectInvitation({
						invitationId,
					});

				if (error) {
					throw error;
				}

				router.replace("/app");
			}
		} catch {
			toastError(t("organizations.invitationModal.error"));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle>{t("organizations.invitationModal.title")}</CardTitle>
				<CardDescription>
					{t("organizations.invitationModal.description", {
						organizationName,
					})}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					<Field>
						<div className="flex items-center gap-3 rounded-lg border p-3">
							<OrganizationLogo
								name={organizationName}
								logoUrl={logoUrl}
								className="size-12"
							/>
							<div>
								<strong className="font-medium text-lg">
									{organizationName}
								</strong>
							</div>
						</div>
					</Field>

					<Field>
						<div className="flex gap-2">
							<Button
								className="flex-1"
								variant="secondary"
								onClick={() => onSelectAnswer(false)}
								disabled={!!submitting}
								loading={submitting === "reject"}
							>
								<HugeiconsIcon
									icon={Cancel01Icon}
									className="mr-1.5 size-4"
									strokeWidth={2}
								/>
								{t("organizations.invitationModal.decline")}
							</Button>
							<Button
								className="flex-1"
								onClick={() => onSelectAnswer(true)}
								disabled={!!submitting}
								loading={submitting === "accept"}
							>
								<HugeiconsIcon
									icon={Tick02Icon}
									className="mr-1.5 size-4"
									strokeWidth={2}
								/>
								{t("organizations.invitationModal.accept")}
							</Button>
						</div>
					</Field>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}
