"use client";

import {
	Alert02Icon,
	ArrowLeft01Icon,
	Mailbox01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
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
import { Input } from "@repo/ui/components/input";
import { useAuthErrorMessages } from "@saas/auth/hooks/errors-messages";
import { zodResolver } from "@shared/lib/zod-form-resolver";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	email: z.string().email(),
});

export function ForgotPasswordForm() {
	const t = useTranslations();
	const { getAuthErrorMessage } = useAuthErrorMessages();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = form.handleSubmit(async ({ email }) => {
		try {
			const redirectTo = new URL(
				"/auth/reset-password",
				window.location.origin,
			).toString();

			const { error } = await authClient.requestPasswordReset({
				email,
				redirectTo,
			});

			if (error) {
				throw error;
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
				<CardTitle>{t("auth.forgotPassword.title")}</CardTitle>
				<CardDescription>
					{t("auth.forgotPassword.message")}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{form.formState.isSubmitSuccessful ? (
					<Alert variant="success">
						<HugeiconsIcon icon={Mailbox01Icon} strokeWidth={2} />
						<AlertTitle>
							{t("auth.forgotPassword.hints.linkSent.title")}
						</AlertTitle>
						<AlertDescription>
							{t("auth.forgotPassword.hints.linkSent.message")}
						</AlertDescription>
					</Alert>
				) : (
					<Form {...form}>
						<form onSubmit={onSubmit}>
							<FieldGroup>
								{form.formState.errors.root && (
									<Alert variant="error">
										<HugeiconsIcon
											icon={Alert02Icon}
											strokeWidth={2}
										/>
										<AlertTitle>
											{form.formState.errors.root.message}
										</AlertTitle>
									</Alert>
								)}

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<Field>
												<FieldLabel htmlFor="email">
													{t(
														"auth.forgotPassword.email",
													)}
												</FieldLabel>
												<FormControl>
													<Input
														id="email"
														{...field}
														autoComplete="email"
														placeholder="m@example.com"
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
										{t("auth.forgotPassword.submit")}
									</Button>

									<FieldDescription className="text-center">
										<Link
											href="/auth/login"
											className="inline-flex items-center gap-1.5"
										>
											<HugeiconsIcon
												icon={ArrowLeft01Icon}
												className="size-4"
												strokeWidth={2}
											/>
											{t(
												"auth.forgotPassword.backToSignin",
											)}
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
