"use client";
import { CheckmarkCircle02Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	type OAuthProvider,
	oAuthProviders,
} from "@saas/auth/constants/oauth-providers";
import { useUserAccountsQuery } from "@saas/auth/lib/api";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { useTranslations } from "next-intl";

export function ConnectedAccountsBlock() {
	const t = useTranslations();

	const { data, isPending } = useUserAccountsQuery();

	const isProviderLinked = (provider: OAuthProvider) =>
		data?.some((account) => account.providerId === provider);

	const linkProvider = (provider: OAuthProvider) => {
		const callbackURL = window.location.href;
		if (!isProviderLinked(provider)) {
			authClient.linkSocial({
				provider,
				callbackURL,
			});
		}
	};

	return (
		<SettingsItem
			title={t("settings.account.security.connectedAccounts.title")}
		>
			<div className="grid grid-cols-1 divide-y">
				{Object.entries(oAuthProviders).map(
					([provider, providerData]) => {
						const isLinked = isProviderLinked(
							provider as OAuthProvider,
						);

						return (
							<div
								key={provider}
								className="flex h-14 items-center justify-between gap-2 py-2"
							>
								<div className="flex items-center gap-2">
									<providerData.icon className="size-4 text-primary/50" />
									<span className="text-sm">
										{providerData.name}
									</span>
								</div>
								{isPending ? (
									<Skeleton className="h-10 w-28" />
								) : isLinked ? (
									<HugeiconsIcon
										icon={CheckmarkCircle02Icon}
										className="size-6 text-success"
										strokeWidth={2}
									/>
								) : (
									<Button
										variant={
											isLinked ? "outline" : "secondary"
										}
										onClick={() =>
											linkProvider(
												provider as OAuthProvider,
											)
										}
									>
										<HugeiconsIcon
											icon={Link01Icon}
											className="mr-1.5 size-4"
											strokeWidth={2}
										/>
										<span>
											{t(
												"settings.account.security.connectedAccounts.connect",
											)}
										</span>
									</Button>
								)}
							</div>
						);
					},
				)}
			</div>
		</SettingsItem>
	);
}
