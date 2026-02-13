"use client";

import { zodResolver } from "@shared/lib/zod-form-resolver";
import {
	Alert02Icon,
	Mailbox01Icon,
	ViewIcon,
	ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import { config as authConfig } from "@repo/auth/config";
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
	FieldSeparator,
} from "@repo/ui/components/field";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useAuthErrorMessages } from "@saas/auth/hooks/errors-messages";
import { useSession } from "@saas/auth/hooks/use-session";
import { OrganizationInvitationAlert } from "@saas/organizations/components/OrganizationInvitationAlert";
import { useRouter } from "@shared/hooks/router";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { withQuery } from "ufo";
import { z } from "zod";
import { config } from "@/config";
import {
	type OAuthProvider,
	oAuthProviders,
} from "../constants/oauth-providers";
import { SocialSigninButton } from "./SocialSigninButton";

const formSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	password: z.string(),
});

export function SignupForm({ prefillEmail }: { prefillEmail?: string }) {
	const t = useTranslations();
	const router = useRouter();
	const { user, loaded: sessionLoaded } = useSession();
	const { getAuthErrorMessage } = useAuthErrorMessages();
	const searchParams = useSearchParams();

	const [showPassword, setShowPassword] = useState(false);
	const invitationId = searchParams.get("invitationId");
	const email = searchParams.get("email");
	const redirectTo = searchParams.get("redirectTo");

	const form = useForm({
		resolver: zodResolver(formSchema),
		values: {
			name: "",
			email: prefillEmail ?? email ?? "",
			password: "",
		},
	});

	const invitationOnlyMode = !authConfig.enableSignup && invitationId;

	const redirectPath = invitationId
		? `/organization-invitation/${invitationId}`
		: (redirectTo ?? config.saas.redirectAfterSignIn);

	useEffect(() => {
		if (sessionLoaded && user) {
			router.replace(redirectPath);
		}
	}, [user, sessionLoaded]);

	const onSubmit = form.handleSubmit(async ({ email, password, name }) => {
		try {
			const { error } = await (authConfig.enablePasswordLogin
				? await authClient.signUp.email({
						email,
						password,
						name,
						callbackURL: redirectPath,
					})
				: authClient.signIn.magicLink({
						email,
						name,
						callbackURL: redirectPath,
					}));

			if (error) {
				throw error;
			}

			if (invitationOnlyMode) {
				const { error } =
					await authClient.organization.acceptInvitation({
						invitationId,
					});

				if (error) {
					throw error;
				}

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
				<CardTitle>{t("auth.signup.title")}</CardTitle>
				<CardDescription>{t("auth.signup.message")}</CardDescription>
			</CardHeader>
			<CardContent>
				{form.formState.isSubmitSuccessful && !invitationOnlyMode ? (
					<Alert variant="success">
						<HugeiconsIcon icon={Mailbox01Icon} strokeWidth={2} />
						<AlertTitle>
							{t("auth.signup.hints.verifyEmail")}
						</AlertTitle>
					</Alert>
				) : (
					<Form {...form}>
						<form onSubmit={onSubmit}>
							<FieldGroup>
								{invitationId && (
									<OrganizationInvitationAlert />
								)}

								{form.formState.isSubmitted &&
									form.formState.errors.root && (
										<Alert variant="error">
											<HugeiconsIcon
												icon={Alert02Icon}
												strokeWidth={2}
											/>
											<AlertTitle>
												{
													form.formState.errors.root
														.message
												}
											</AlertTitle>
										</Alert>
									)}

								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<Field>
												<FieldLabel htmlFor="name">
													{t("auth.signup.name")}
												</FieldLabel>
												<FormControl>
													<Input
														id="name"
														{...field}
													/>
												</FormControl>
											</Field>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<Field>
												<FieldLabel htmlFor="email">
													{t("auth.signup.email")}
												</FieldLabel>
												<FormControl>
													<Input
														id="email"
														{...field}
														autoComplete="email"
														placeholder="m@example.com"
														readOnly={
															!!prefillEmail
														}
													/>
												</FormControl>
											</Field>
										</FormItem>
									)}
								/>

								{authConfig.enablePasswordLogin && (
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<Field>
													<FieldLabel htmlFor="password">
														{t(
															"auth.signup.password",
														)}
													</FieldLabel>
													<FormControl>
														<div className="relative">
															<Input
																id="password"
																type={
																	showPassword
																		? "text"
																		: "password"
																}
																className="pr-10"
																{...field}
																autoComplete="new-password"
															/>
															<button
																type="button"
																onClick={() =>
																	setShowPassword(
																		!showPassword,
																	)
																}
																className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground"
															>
																{showPassword ? (
																	<HugeiconsIcon
																		icon={
																			ViewOffIcon
																		}
																		className="size-4"
																		strokeWidth={
																			2
																		}
																	/>
																) : (
																	<HugeiconsIcon
																		icon={
																			ViewIcon
																		}
																		className="size-4"
																		strokeWidth={
																			2
																		}
																	/>
																)}
															</button>
														</div>
													</FormControl>
												</Field>
											</FormItem>
										)}
									/>
								)}

								<Field>
									<Button
										className="w-full"
										type="submit"
										loading={form.formState.isSubmitting}
									>
										{t("auth.signup.submit")}
									</Button>
								</Field>

								{authConfig.enableSignup &&
									authConfig.enableSocialLogin && (
										<>
											<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card mt-b">
												{t("auth.login.continueWith")}
											</FieldSeparator>
											<Field>
												{Object.keys(
													oAuthProviders,
												).map((providerId) => (
													<SocialSigninButton
														key={providerId}
														provider={
															providerId as OAuthProvider
														}
													/>
												))}
											</Field>
										</>
									)}

								<Field>
									<FieldDescription className="text-center">
										{t("auth.signup.alreadyHaveAccount")}{" "}
										<Link
											href={withQuery(
												"/auth/login",
												Object.fromEntries(
													searchParams.entries(),
												),
											)}
										>
											{t("auth.signup.signIn")}
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
