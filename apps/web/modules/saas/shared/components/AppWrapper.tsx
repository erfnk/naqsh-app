"use client";

import {
	ArrowDown01Icon,
	Home01Icon,
	Logout01Icon,
	Settings01Icon,
	UserSettings01Icon,
	UserSettings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Logo,
	Sidebar15,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui";
import { useSession } from "@saas/auth/hooks/use-session";
import { BoardSidebarContent } from "@saas/boards/components/BoardSidebarContent";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";
import { UserAvatar } from "@shared/components/UserAvatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Fragment, type PropsWithChildren, useMemo } from "react";
import { config } from "@/config";

function kebabToCamel(s: string): string {
	return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function AppWrapper({ children }: PropsWithChildren) {
	const t = useTranslations();
	const pathname = usePathname();
	const { user } = useSession();
	const { activeOrganization, isOrganizationAdmin } = useActiveOrganization();

	const basePath = activeOrganization
		? `/app/${activeOrganization.slug}`
		: "/app";

	const header = (
		<>
			<div className="flex items-center gap-2 px-2 py-2">
				<Link href="/app" className="block">
					<Logo withLabel={false} />
				</Link>
				<p className="text-sm font-medium">
					{activeOrganization?.name}
				</p>
			</div>
		</>
	);

	const sidebarContent = activeOrganization ? <BoardSidebarContent /> : null;

	const onLogout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: async () => {
					window.location.href = new URL(
						config.saas.redirectAfterLogout,
						window.location.origin,
					).toString();
				},
			},
		});
	};

	const footer = user ? (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="lg">
							<UserAvatar
								name={user.name ?? ""}
								avatarUrl={user.image}
								className="size-6"
							/>
							<span className="flex-1 text-left leading-tight">
								<span className="block truncate text-sm font-medium">
									{user.name}
								</span>
								<span className="block truncate text-xs opacity-70">
									{user.email}
								</span>
							</span>
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								className="ml-auto size-4 opacity-50"
								strokeWidth={2}
							/>
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="start"
						side="top"
						sideOffset={8}
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
					>
						<DropdownMenuGroup>
							<DropdownMenuLabel>
								{user.name}
								<span className="block font-normal text-xs opacity-70">
									{user.email}
								</span>
							</DropdownMenuLabel>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="flex items-center justify-between gap-4 hover:bg-transparent focus:bg-transparent"
							onSelect={(e) => e.preventDefault()}
						>
							<span>{t("app.userMenu.colorMode")}</span>
							<ColorModeToggle />
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						{activeOrganization && isOrganizationAdmin && (
							<DropdownMenuItem asChild>
								<Link href={`${basePath}/settings`}>
									<HugeiconsIcon
										icon={Settings01Icon}
										className="mr-2 size-4"
										strokeWidth={2}
									/>
									{t("app.menu.organizationSettings")}
								</Link>
							</DropdownMenuItem>
						)}

						<DropdownMenuItem asChild>
							<Link href="/app/settings/general">
								<HugeiconsIcon
									icon={UserSettings02Icon}
									className="mr-2 size-4"
									strokeWidth={2}
								/>
								{t("app.userMenu.accountSettings")}
							</Link>
						</DropdownMenuItem>

						{user.role === "admin" && (
							<DropdownMenuItem asChild>
								<Link href="/app/admin">
									<HugeiconsIcon
										icon={UserSettings01Icon}
										className="mr-2 size-4"
										strokeWidth={2}
									/>
									{t("app.menu.admin")}
								</Link>
							</DropdownMenuItem>
						)}

						<DropdownMenuItem asChild>
							<Link href="/">
								<HugeiconsIcon
									icon={Home01Icon}
									className="mr-2 size-4"
									strokeWidth={2}
								/>
								{t("app.userMenu.home")}
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={onLogout}>
							<HugeiconsIcon
								icon={Logout01Icon}
								className="mr-2 size-4"
								strokeWidth={2}
							/>
							{t("app.userMenu.logout")}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	) : null;

	const breadcrumbItems = useMemo(() => {
		const items: { label: string; href: string }[] = [
			{ label: t("app.menu.start"), href: basePath },
		];

		if (pathname.startsWith("/app/admin")) {
			items.push({ label: t("app.menu.admin"), href: "/app/admin" });
			const sub = pathname.split("/app/admin/")[1];
			if (sub) {
				const segment = sub.split("/")[0];
				items.push({
					label: t(`admin.menu.${segment}`),
					href: `/app/admin/${segment}`,
				});
			}
		} else if (pathname.startsWith("/app/settings")) {
			items.push({
				label: t("app.menu.accountSettings"),
				href: "/app/settings",
			});
			const sub = pathname.split("/app/settings/")[1];
			if (sub) {
				const segment = sub.split("/")[0];
				const key = kebabToCamel(segment);
				items.push({
					label: t(`settings.menu.account.${key}`),
					href: `/app/settings/${segment}`,
				});
			}
		} else if (
			activeOrganization &&
			pathname.startsWith(`${basePath}/settings`)
		) {
			items.push({
				label: t("app.menu.organizationSettings"),
				href: `${basePath}/settings`,
			});
			const sub = pathname.split(`${basePath}/settings/`)[1];
			if (sub) {
				const segment = sub.split("/")[0];
				const key = kebabToCamel(segment);
				items.push({
					label: t(`settings.menu.organization.${key}`),
					href: `${basePath}/settings/${segment}`,
				});
			}
		} else if (
			activeOrganization &&
			pathname.includes(`${basePath}/boards`)
		) {
			items.push({
				label: t("app.menu.boards"),
				href: `${basePath}/boards`,
			});
		}

		return items;
	}, [pathname, basePath, activeOrganization, t]);

	const breadcrumbs = (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbItems.map((item, index) => (
					<Fragment key={item.href}>
						{index > 0 && <BreadcrumbSeparator />}
						<BreadcrumbItem>
							{index === breadcrumbItems.length - 1 ? (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink
									render={<Link href={item.href} />}
								>
									{item.label}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);

	return (
		<Sidebar15
			header={header}
			sidebarContent={sidebarContent}
			footer={footer}
			breadcrumbs={breadcrumbs}
		>
			<div className="min-w-0 p-4">
				<div className="container px-0">{children}</div>
			</div>
		</Sidebar15>
	);
}
