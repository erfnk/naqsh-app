import { Building06Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { config } from "@repo/auth/config";
import { Logo } from "@repo/ui";
import { getSession } from "@saas/auth/lib/server";
import { SettingsMenu } from "@saas/settings/components/SettingsMenu";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

export default async function AdminLayout({ children }: PropsWithChildren) {
	const t = await getTranslations();
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	if (session.user?.role !== "admin") {
		redirect("/app");
	}

	return (
		<>
			<PageHeader
				title={t("admin.title")}
				subtitle={t("admin.description")}
			/>

			<SettingsMenu
				className="mb-6"
				menuItems={[
					{
						avatar: <Logo className="size-8" withLabel={false} />,
						title: t("admin.title"),
						items: [
							{
								title: t("admin.menu.users"),
								href: "/app/admin/users",
								icon: (
									<HugeiconsIcon
										icon={UserMultipleIcon}
										className="size-4 opacity-50"
										strokeWidth={2}
									/>
								),
							},
							...(config.organizations.enable
								? [
										{
											title: t(
												"admin.menu.organizations",
											),
											href: "/app/admin/organizations",
											icon: (
												<HugeiconsIcon
													icon={Building06Icon}
													className="size-4 opacity-50"
													strokeWidth={2}
												/>
											),
										},
									]
								: []),
						],
					},
				]}
			/>

			{children}
		</>
	);
}
