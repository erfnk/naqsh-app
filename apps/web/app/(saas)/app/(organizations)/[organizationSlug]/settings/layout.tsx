import { isOrganizationAdmin } from "@repo/auth/lib/helper";
import { getActiveOrganization, getSession } from "@saas/auth/lib/server";
import { OrganizationLogo } from "@saas/organizations/components/OrganizationLogo";
import { SettingsMenu } from "@saas/settings/components/SettingsMenu";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Settings02Icon,
	Alert02Icon,
	UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

export default async function SettingsLayout({
	children,
	params,
}: PropsWithChildren<{
	params: Promise<{ organizationSlug: string }>;
}>) {
	const t = await getTranslations();
	const session = await getSession();
	const { organizationSlug } = await params;
	const organization = await getActiveOrganization(organizationSlug);

	if (!organization) {
		redirect("/app");
	}

	const userIsOrganizationAdmin = isOrganizationAdmin(
		organization,
		session?.user,
	);

	const organizationSettingsBasePath = `/app/${organizationSlug}/settings`;

	const menuItems = [
		{
			title: t("settings.menu.organization.title"),
			avatar: (
				<OrganizationLogo
					name={organization.name}
					logoUrl={organization.logo}
				/>
			),
			items: [
				{
					title: t("settings.menu.organization.general"),
					href: `${organizationSettingsBasePath}/general`,
					icon: <HugeiconsIcon icon={Settings02Icon} className="size-4 opacity-50" strokeWidth={2} />,
				},
				{
					title: t("settings.menu.organization.members"),
					href: `${organizationSettingsBasePath}/members`,
					icon: <HugeiconsIcon icon={UserMultiple02Icon} className="size-4 opacity-50" strokeWidth={2} />,
				},
				...(userIsOrganizationAdmin
					? [
							{
								title: t(
									"settings.menu.organization.dangerZone",
								),
								href: `${organizationSettingsBasePath}/danger-zone`,
								icon: (
									<HugeiconsIcon icon={Alert02Icon} className="size-4 opacity-50" strokeWidth={2} />
								),
							},
						]
					: []),
			],
		},
	];

	return (
		<>
			<PageHeader
				title={t("organizations.settings.title")}
				subtitle={t("organizations.settings.subtitle")}
			/>

			<SettingsMenu menuItems={menuItems} className="mb-6" />

			{children}
		</>
	);
}
