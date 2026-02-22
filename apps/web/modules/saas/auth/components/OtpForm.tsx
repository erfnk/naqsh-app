"use client";

import { Alert02Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
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
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@repo/ui/components/input-otp";
import { useAuthErrorMessages } from "@saas/auth/hooks/errors-messages";
import { useRouter } from "@shared/hooks/router";
import { zodResolver } from "@shared/lib/zod-form-resolver";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { config } from "@/config";

const formSchema = z.object({
	code: z.string().min(6).max(6),
});

export function OtpForm() {
	const t = useTranslations();
	const router = useRouter();
	const { getAuthErrorMessage } = useAuthErrorMessages();
	const searchParams = useSearchParams();

	const invitationId = searchParams.get("invitationId");
	const redirectTo = searchParams.get("redirectTo");

	const redirectPath = invitationId
		? `/organization-invitation/${invitationId}`
		: (redirectTo ?? config.saas.redirectAfterSignIn);

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			code: "",
		},
	});

	const onSubmit = form.handleSubmit(async ({ code }) => {
		try {
			const { error } = await authClient.twoFactor.verifyTotp({
				code,
			});

			if (error) {
				throw error;
			}

			router.replace(redirectPath);
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
				<CardTitle>{t("auth.verify.title")}</CardTitle>
				<CardDescription>{t("auth.verify.message")}</CardDescription>
			</CardHeader>
			<CardContent>
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
								name="code"
								render={({ field }) => (
									<FormItem>
										<Field>
											<FieldLabel htmlFor="code">
												{t("auth.verify.code")}
											</FieldLabel>
											<FormControl>
												<InputOTP
													maxLength={6}
													{...field}
													autoComplete="one-time-code"
													onChange={(value) => {
														field.onChange(value);
														onSubmit();
													}}
												>
													<InputOTPGroup>
														<InputOTPSlot
															className="size-10 text-lg"
															index={0}
														/>
														<InputOTPSlot
															className="size-10 text-lg"
															index={1}
														/>
														<InputOTPSlot
															className="size-10 text-lg"
															index={2}
														/>
													</InputOTPGroup>
													<InputOTPSeparator className="opacity-40" />
													<InputOTPGroup>
														<InputOTPSlot
															className="size-10 text-lg"
															index={3}
														/>
														<InputOTPSlot
															className="size-10 text-lg"
															index={4}
														/>
														<InputOTPSlot
															className="size-10 text-lg"
															index={5}
														/>
													</InputOTPGroup>
												</InputOTP>
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
									{t("auth.verify.submit")}
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
										{t("auth.verify.backToSignin")}
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
