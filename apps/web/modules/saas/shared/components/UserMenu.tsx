"use client";

import {
	Home01Icon,
	Logout01Icon,
	MoreVerticalIcon,
	Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { authClient } from "@repo/auth/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui";
import { useSession } from "@saas/auth/hooks/use-session";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";
import { UserAvatar } from "@shared/components/UserAvatar";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { config } from "@/config";

export function UserMenu({ showUserName }: { showUserName?: boolean }) {
	const t = useTranslations();
	const { user } = useSession();

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

	if (!user) {
		return null;
	}

	const { name, email, image } = user;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg outline-hidden focus-visible:ring-2 focus-visible:ring-primary md:w-[100%+1rem] md:px-2 md:py-1.5 md:hover:bg-primary/5"
					aria-label="User menu"
				>
					<span className="flex items-center gap-2">
						<UserAvatar name={name ?? ""} avatarUrl={image} />
						{showUserName && (
							<span className="text-left leading-tight">
								<span className="font-medium text-sm">
									{name}
								</span>
								<span className="block text-xs opacity-70">
									{email}
								</span>
							</span>
						)}
					</span>

					{showUserName && (
						<HugeiconsIcon
							icon={MoreVerticalIcon}
							className="size-4"
							strokeWidth={2}
						/>
					)}
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						{name}
						<span className="block font-normal text-xs opacity-70">
							{email}
						</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				{/* Color mode selection */}
				<DropdownMenuItem
					className="flex items-center justify-between gap-4 hover:bg-transparent focus:bg-transparent"
					onSelect={(e) => e.preventDefault()}
				>
					<span>{t("app.userMenu.colorMode")}</span>
					<ColorModeToggle />
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild>
					<Link href="/app/settings/general">
						<HugeiconsIcon
							icon={Settings01Icon}
							className="mr-2 size-4"
							strokeWidth={2}
						/>
						{t("app.userMenu.accountSettings")}
					</Link>
				</DropdownMenuItem>

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
	);
}
