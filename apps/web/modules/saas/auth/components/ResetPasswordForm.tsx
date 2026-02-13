"use client";

import { zodResolver } from "@shared/lib/zod-form-resolver";
import { Alert02Icon, ArrowLeft01Icon, Mailbox01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import { Alert, AlertTitle } from "@repo/ui/components/alert";
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
import { PasswordInput } from "@repo/ui/components/password-input";
import { useAuthErrorMessages } from "@saas/auth/hooks/errors-messages";
import { useSession } from "@saas/auth/hooks/use-session";
import { useRouter } from "@shared/hooks/router";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { config } from "@/config";

const formSchema = z.object({
	password: z.string().min(8),
});

export function ResetPasswordForm() {
	const t = useTranslations();
	const { user } = useSession();
	const router = useRouter();
	const { getAuthErrorMessage } = useAuthErrorMessages();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
		},
	});

	const onSubmit = form.handleSubmit(async ({ password }) => {
		try {
			const { error } = await authClient.resetPassword({
				token: token ?? undefined,
				newPassword: password,
			});

			if (error) {
				throw error;
			}

			if (user) {
				router.push(config.saas.redirectAfterSignIn);
			}
		} catch (e) {
			form.setError("root", {
				message: getAuthErrorMessage(
					e && typeof e === "object" && "code" in e
						? (e.code as string)
						: undefined,
				),
			});
		}
	});

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle>{t("auth.resetPassword.title")}</CardTitle>
				<CardDescription>
					{t("auth.resetPassword.message")}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{form.formState.isSubmitSuccessful ? (
					<Alert variant="success">
						<HugeiconsIcon icon={Mailbox01Icon} strokeWidth={2} />
						<AlertTitle>
							{t("auth.resetPassword.hints.success")}
						</AlertTitle>
					</Alert>
				) : (
					<Form {...form}>
						<form onSubmit={onSubmit}>
							<FieldGroup>
								{form.formState.errors.root && (
									<Alert variant="error">
										<HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
										<AlertTitle>
											{form.formState.errors.root.message}
										</AlertTitle>
									</Alert>
								)}

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<Field>
												<FieldLabel htmlFor="password">
													{t("auth.resetPassword.newPassword")}
												</FieldLabel>
												<FormControl>
													<PasswordInput
														id="password"
														autoComplete="new-password"
														{...field}
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
										{t("auth.resetPassword.submit")}
									</Button>

									<FieldDescription className="text-center">
										<Link href="/auth/login" className="inline-flex items-center gap-1.5">
											<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
											{t("auth.resetPassword.backToSignin")}
										</Link>
									</FieldDescription>
								</Field>
							</FieldGroup>
						</form>
					</Form>
				)}
			</CardContent>
		</Card>
	);
}
