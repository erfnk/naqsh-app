import {
	Clock01Icon,
	Settings02Icon,
	UserMultiple02Icon,
	UserSettings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getRecentUserTasks } from "@repo/database";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { getActiveOrganization, getSession } from "@saas/auth/lib/server";
import { UserAvatar } from "@shared/components/UserAvatar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

const ROLE_PRIORITY: Record<string, number> = {
	owner: 0,
	admin: 1,
	member: 2,
};

const ROLE_BADGE_STATUS: Record<string, "success" | "warning" | "info"> = {
	owner: "success",
	admin: "warning",
	member: "info",
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;

	const activeOrganization = await getActiveOrganization(organizationSlug);

	return {
		title: activeOrganization?.name,
	};
}

export default async function OrganizationPage({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const t = await getTranslations();
	const session = await getSession();

	const activeOrganization = await getActiveOrganization(organizationSlug);

	if (!activeOrganization || !session) {
		return notFound();
	}

	const tasks = await getRecentUserTasks(
		session.user.id,
		activeOrganization.id,
	);

	const sortedMembers = [...activeOrganization.members].sort(
		(a, b) => (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99),
	);

	return (
		<div className="md:flex md:min-h-[calc(100vh-10rem)] md:items-center md:justify-center">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Card 1: Recent Tasks */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-1">
							<HugeiconsIcon
								icon={Clock01Icon}
								className="size-4 text-muted-foreground"
								strokeWidth={2}
							/>
							<CardTitle>
								{t("organizations.start.recentTasks.title")}
							</CardTitle>
						</div>
						<CardDescription>
							{t("organizations.start.recentTasks.description")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{tasks.length > 0 ? (
							<ul className="flex flex-col gap-1 space-y-1">
								{tasks.map((task) => (
									<li key={task.id}>
										<Link
											href={`/app/${organizationSlug}/boards/${task.board.slug}`}
											className="flex items-center gap-1 text-sm transition-colors"
										>
											<span className="truncate font-medium">
												{task.title}
											</span>
											<span className="text-muted-foreground">
												/
											</span>
											<span className="shrink-0 text-muted-foreground">
												{task.board.title}
											</span>
										</Link>
									</li>
								))}
							</ul>
						) : (
							<Empty className="border-none py-4">
								<EmptyHeader>
									<EmptyTitle>
										{t(
											"organizations.start.recentTasks.emptyTitle",
										)}
									</EmptyTitle>
									<EmptyDescription>
										{t(
											"organizations.start.recentTasks.emptyDescription",
										)}
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</CardContent>
				</Card>

				{/* Card 2: Organization Members */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={UserMultiple02Icon}
								className="size-5 text-muted-foreground"
								strokeWidth={2}
							/>
							<CardTitle>
								{t("organizations.start.members.title")}
							</CardTitle>
						</div>
						<CardDescription>
							{t("organizations.start.members.description", {
								count: sortedMembers.length,
							})}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3">
							{sortedMembers.map((member) => (
								<li
									key={member.id}
									className="flex items-center gap-2"
								>
									<UserAvatar
										name={
											member.user.name ??
											member.user.email
										}
										avatarUrl={member.user.image}
										className="size-8"
									/>
									<div className="flex min-w-0 flex-1 items-center justify-between gap-2">
										<span className="truncate font-medium text-sm">
											{member.user.name ??
												member.user.email}
										</span>
										<Badge
											status={
												ROLE_BADGE_STATUS[
													member.role
												] ?? "info"
											}
											className="font-medium"
										>
											{t(
												`organizations.roles.${member.role}` as "organizations.roles.owner",
											)}
										</Badge>
									</div>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				{/* Card 3: Organization Settings */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={Settings02Icon}
								className="size-5 text-muted-foreground"
								strokeWidth={2}
							/>
							<CardTitle>
								{activeOrganization.name} Setting
							</CardTitle>
						</div>
						<CardDescription>
							{t("organizations.start.settings.description")}
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex flex-col gap-2">
						<Button
							render={
								<Link
									href={`/app/${organizationSlug}/settings/general`}
								/>
							}
							className="w-full"
						>
							<HugeiconsIcon
								icon={Settings02Icon}
								className="ml-1 size-4"
								strokeWidth={2}
							/>
							{t("organizations.start.settings.goToSettings")}
						</Button>
						<Button
							variant="outline"
							render={<Link href="/app/settings/general" />}
							className="w-full"
						>
							<HugeiconsIcon
								icon={UserSettings01Icon}
								className="mr-1 size-4"
								strokeWidth={2}
							/>
							{t("organizations.start.settings.goToProfile")}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
