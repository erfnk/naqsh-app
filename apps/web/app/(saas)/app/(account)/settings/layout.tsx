import { getSession } from "@saas/auth/lib/server";
import { SettingsMenu } from "@saas/settings/components/SettingsMenu";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { UserAvatar } from "@shared/components/UserAvatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	LockPasswordIcon,
	Settings01Icon,
	Alert02Icon,
} from "@hugeicons/core-free-icons";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
export default async function SettingsLayout({ children }: PropsWithChildren) {
	const t = await getTranslations();
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const menuItems = [
		{
			title: t("settings.menu.account.title"),
			avatar: (
				<UserAvatar
					name={session.user.name ?? ""}
					avatarUrl={session.user.image}
				/>
			),
			items: [
				{
					title: t("settings.menu.account.general"),
					href: "/app/settings/general",
					icon: <HugeiconsIcon icon={Settings01Icon} className="size-4 opacity-50" strokeWidth={2} />,
				},
				{
					title: t("settings.menu.account.security"),
					href: "/app/settings/security",
					icon: <HugeiconsIcon icon={LockPasswordIcon} className="size-4 opacity-50" strokeWidth={2} />,
				},
				{
					title: t("settings.menu.account.dangerZone"),
					href: "/app/settings/danger-zone",
					icon: <HugeiconsIcon icon={Alert02Icon} className="size-4 opacity-50" strokeWidth={2} />,
				},
			],
		},
	];

	return (
		<>
			<PageHeader
				title={t("settings.account.title")}
				subtitle={t("settings.account.subtitle")}
			/>

			<SettingsMenu menuItems={menuItems} className="mb-6" />

			{children}
		</>
	);
}
