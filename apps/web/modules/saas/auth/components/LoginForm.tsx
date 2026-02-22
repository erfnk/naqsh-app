"use client";

import {
	Alert02Icon,
	Key01Icon,
	Mailbox01Icon,
	ViewIcon,
	ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import { config as authConfig } from "@repo/auth/config";
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
import { sessionQueryKey } from "@saas/auth/lib/api";
import { OrganizationInvitationAlert } from "@saas/organizations/components/OrganizationInvitationAlert";
import { useRouter } from "@shared/hooks/router";
import { zodResolver } from "@shared/lib/zod-form-resolver";
import { useQueryClient } from "@tanstack/react-query";
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
import { useSession } from "../hooks/use-session";
import { LoginModeSwitch } from "./LoginModeSwitch";
import { SocialSigninButton } from "./SocialSigninButton";

const formSchema = z.union([
	z.object({
		mode: z.literal("magic-link"),
		email: z.email(),
	}),
	z.object({
		mode: z.literal("password"),
		email: z.email(),
		password: z.string().min(1),
	}),
]);

export function LoginForm() {
	const t = useTranslations();
	const { getAuthErrorMessage } = useAuthErrorMessages();
	const router = useRouter();
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const { user, loaded: sessionLoaded } = useSession();

	const [showPassword, setShowPassword] = useState(false);
	const invitationId = searchParams.get("invitationId");
	const email = searchParams.get("email");
	const redirectTo = searchParams.get("redirectTo");

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: email ?? "",
			password: "",
			mode: authConfig.enablePasswordLogin ? "password" : "magic-link",
		},
	});

	const redirectPath = invitationId
		? `/organization-invitation/${invitationId}`
		: (redirectTo ?? config.saas.redirectAfterSignIn);

	useEffect(() => {
		if (sessionLoaded && user) {
			router.replace(redirectPath);
		}
	}, [user, sessionLoaded]);

	const onSubmit = form.handleSubmit(async (values) => {
		try {
			if (values.mode === "password") {
				const { data, error } = await authClient.signIn.email({
					...values,
				});

				if (error) {
					throw error;
				}

				if ((data as any).twoFactorRedirect) {
					router.replace(
						withQuery(
							"/auth/verify",
							Object.fromEntries(searchParams.entries()),
						),
					);
					return;
				}

				queryClient.invalidateQueries({
					queryKey: sessionQueryKey,
				});

				router.replace(redirectPath);
			} else {
				const { error } = await authClient.signIn.magicLink({
					...values,
					callbackURL: redirectPath,
				});

				if (error) {
					throw error;
				}
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

	const signInWithPasskey = async () => {
		try {
			await authClient.signIn.passkey();

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
	};

	const signinMode = form.watch("mode");

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle>{t("auth.login.title")}</CardTitle>
				<CardDescription>{t("auth.login.subtitle")}</CardDescription>
			</CardHeader>
			<CardContent>
				{form.formState.isSubmitSuccessful &&
				signinMode === "magic-link" ? (
					<Alert variant="success">
						<HugeiconsIcon icon={Mailbox01Icon} strokeWidth={2} />
						<AlertTitle>
							{t("auth.login.hints.linkSent.title")}
						</AlertTitle>
						<AlertDescription>
							{t("auth.login.hints.linkSent.message")}
						</AlertDescription>
					</Alert>
				) : (
					<Form {...form}>
						<form onSubmit={onSubmit}>
							<FieldGroup>
								{invitationId && (
									<OrganizationInvitationAlert />
								)}

								{authConfig.enableMagicLink &&
									authConfig.enablePasswordLogin && (
										<LoginModeSwitch
											activeMode={signinMode}
											onChange={(mode) =>
												form.setValue(
													"mode",
													mode as typeof signinMode,
												)
											}
										/>
									)}

								{form.formState.isSubmitted &&
									form.formState.errors.root?.message && (
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

								{(authConfig.enableSignup &&
									authConfig.enableSocialLogin) ||
								authConfig.enablePasskeys ? (
									<>
										<Field>
											{authConfig.enableSignup &&
												authConfig.enableSocialLogin &&
												Object.keys(oAuthProviders).map(
													(providerId) => (
														<SocialSigninButton
															key={providerId}
															provider={
																providerId as OAuthProvider
															}
														/>
													),
												)}

											{authConfig.enablePasskeys && (
												<Button
													variant="outline"
													type="button"
													className="w-full"
													onClick={() =>
														signInWithPasskey()
													}
												>
													<HugeiconsIcon
														icon={Key01Icon}
														className="mr-1.5 size-4"
														strokeWidth={2}
													/>
													{t(
														"auth.login.loginWithPasskey",
													)}
												</Button>
											)}
										</Field>
										<FieldSeparator className="mt-1 *:data-[slot=field-separator-content]:bg-card">
											{t("auth.login.continueWith")}
										</FieldSeparator>
									</>
								) : null}

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
													/>
												</FormControl>
											</Field>
										</FormItem>
									)}
								/>

								{authConfig.enablePasswordLogin &&
									signinMode === "password" && (
										<FormField
											control={form.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<Field>
														<div className="flex items-center">
															<FieldLabel htmlFor="password">
																{t(
																	"auth.signup.password",
																)}
															</FieldLabel>
															<Link
																href="/auth/forgot-password"
																className="ml-auto text-sm underline-offset-4 hover:underline"
															>
																{t(
																	"auth.login.forgotPassword",
																)}
															</Link>
														</div>
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
																	autoComplete="current-password"
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
										{signinMode === "magic-link"
											? t("auth.login.sendMagicLink")
											: t("auth.login.submit")}
									</Button>

									{authConfig.enableSignup && (
										<FieldDescription className="text-center">
											{t("auth.login.dontHaveAnAccount")}{" "}
											<Link
												href={withQuery(
													"/auth/signup",
													Object.fromEntries(
														searchParams.entries(),
													),
												)}
											>
												{t(
													"auth.login.createAnAccount",
												)}
											</Link>
										</FieldDescription>
									)}
								</Field>
							</FieldGroup>
						</form>
					</Form>
				)}
			</CardContent>
		</Card>
	);
}
