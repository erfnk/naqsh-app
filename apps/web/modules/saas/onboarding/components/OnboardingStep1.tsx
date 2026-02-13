"use client";

import { zodResolver } from "@shared/lib/zod-form-resolver";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import {
	Field,
	FieldDescription,
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
import { useSession } from "@saas/auth/hooks/use-session";
import { UserAvatarUpload } from "@saas/settings/components/UserAvatarUpload";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	name: z.string(),
});

export function OnboardingStep1({ onCompleted }: { onCompleted: () => void }) {
	const t = useTranslations();
	const { user } = useSession();
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: user?.name ?? "",
		},
	});

	useEffect(() => {
		if (user) {
			form.setValue("name", user.name ?? "");
		}
	}, [user]);

	const onSubmit = form.handleSubmit(async ({ name }) => {
		form.clearErrors("root");

		try {
			await authClient.updateUser({
				name,
			});

			onCompleted();
		} catch {
			form.setError("root", {
				type: "server",
				message: t("onboarding.notifications.accountSetupFailed"),
			});
		}
	});

	return (
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
										{t("onboarding.account.name")}
									</FieldLabel>
									<FormControl>
										<Input id="name" {...field} />
									</FormControl>
								</Field>
							</FormItem>
						)}
					/>

					<Field>
						<div className="flex items-center justify-between gap-4">
							<div>
								<FieldLabel>
									{t("onboarding.account.avatar")}
								</FieldLabel>
								<FieldDescription>
									{t("onboarding.account.avatarDescription")}
								</FieldDescription>
							</div>
							<UserAvatarUpload
								onSuccess={() => {
									return;
								}}
								onError={() => {
									return;
								}}
							/>
						</div>
					</Field>

					<Field>
						<Button
							className="w-full"
							type="submit"
							loading={form.formState.isSubmitting}
						>
							{t("onboarding.continue")}
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="ml-2 size-4"
								strokeWidth={2}
							/>
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</Form>
	);
}
