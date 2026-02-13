"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ElementType, ReactNode } from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { Separator } from "./separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "./sidebar";

interface NavItem {
	label: string;
	icon: ReactNode;
	href: string;
	isActive?: boolean;
	children?: NavItem[];
}

interface NavGroup {
	title: string;
	items: NavItem[];
}

interface Sidebar15Props {
	header?: ReactNode;
	navGroups?: NavGroup[];
	sidebarContent?: ReactNode;
	footer?: ReactNode;
	breadcrumbs?: ReactNode;
	children?: ReactNode;
	className?: string;
	linkComponent?: ElementType;
}

const SidebarNavMenuItem = ({
	item,
	linkComponent: LinkComponent = "a",
}: { item: NavItem; linkComponent?: ElementType }) => {
	if (!item.children?.length) {
		return (
			<SidebarMenuItem>
				<SidebarMenuButton
					render={<LinkComponent href={item.href} />}
					isActive={item.isActive}
				>
					{item.icon}
					<span>{item.label}</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		);
	}

	return (
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton isActive={item.isActive}>
						{item.icon}
						<span>{item.label}</span>
						<HugeiconsIcon
							icon={ArrowDown01Icon}
							className="ml-auto size-4"
							strokeWidth={2}
						/>
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="min-w-48 rounded-lg"
					side="bottom"
					align="start"
					sideOffset={4}
				>
					{item.children.map((child) => (
						<DropdownMenuItem key={child.label} asChild>
							<LinkComponent
								href={child.href}
								className="flex items-center gap-2"
							>
								{child.icon}
								<span>{child.label}</span>
							</LinkComponent>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
};

function Sidebar15({
	header,
	navGroups,
	sidebarContent,
	footer,
	breadcrumbs,
	children,
	className,
	linkComponent,
}: Sidebar15Props) {
	return (
		<SidebarProvider className={className}>
			<Sidebar>
				{header && <SidebarHeader>{header}</SidebarHeader>}

				<SidebarContent>
					{sidebarContent ??
						navGroups?.map((group) => (
							<SidebarGroup key={group.title}>
								<SidebarGroupLabel>
									{group.title}
								</SidebarGroupLabel>
								<SidebarGroupContent>
									<SidebarMenu>
										{group.items.map((item) => (
											<SidebarNavMenuItem
												key={item.label}
												item={item}
												linkComponent={linkComponent}
											/>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>
						))}
				</SidebarContent>

				{footer && <SidebarFooter>{footer}</SidebarFooter>}

				<SidebarRail />
			</Sidebar>

			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					{breadcrumbs}
				</header>
				<div className="flex flex-1 flex-col min-w-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

export { Sidebar15 };
export type { Sidebar15Props, NavGroup, NavItem };
