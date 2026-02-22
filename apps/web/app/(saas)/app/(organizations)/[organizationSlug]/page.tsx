import {
	ArrowRight01Icon,
	Clock01Icon,
	Settings02Icon,
	UserMultiple02Icon,
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
import { PageHeader } from "@saas/shared/components/PageHeader";
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
		<div>
			<PageHeader
				title={activeOrganization.name}
				subtitle={t("organizations.start.subtitle")}
			/>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Card 1: Recent Tasks */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<HugeiconsIcon
								icon={Clock01Icon}
								className="size-5 text-muted-foreground"
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
							<ul className="space-y-3">
								{tasks.map((task) => (
									<li key={task.id}>
										<Link
											href={`/app/${organizationSlug}/boards/${task.board.slug}`}
											className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-muted"
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
									className="flex items-center gap-3"
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
								{t("organizations.start.settings.title")}
							</CardTitle>
						</div>
						<CardDescription>
							{t("organizations.start.settings.description")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							{activeOrganization.name}
						</p>
					</CardContent>
					<CardFooter>
						<Button
							render={
								<Link
									href={`/app/${organizationSlug}/settings/general`}
								/>
							}
						>
							{t("organizations.start.settings.goToSettings")}
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="ml-1 size-4"
								strokeWidth={2}
							/>
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
