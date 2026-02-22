"use client";

import { Cancel01Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@repo/ui";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { UserAvatar } from "@shared/components/UserAvatar";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { PRIORITY_CONFIG } from "../lib/constants";

interface BoardToolbarProps {
	boardTitle: string;
}

// biome-ignore lint/correctness/noUnusedFunctionParameters: <explanation >
export function BoardToolbar({ boardTitle }: BoardToolbarProps) {
	const t = useTranslations();
	const { activeOrganization } = useActiveOrganization();

	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [assignee, setAssignee] = useQueryState(
		"assignee",
		parseAsString.withDefault(""),
	);
	const [priority, setPriority] = useQueryState(
		"priority",
		parseAsString.withDefault(""),
	);

	const { data: members = [] } = useQuery(
		orpc.boards.members.list.queryOptions({
			input: { organizationId: activeOrganization?.id ?? "" },
			enabled: !!activeOrganization?.id,
		}),
	);

	const selectedMember = members.find((m) => m.id === assignee);
	const hasActiveFilters = !!assignee || !!priority;

	function clearFilters() {
		setAssignee(null);
		setPriority(null);
		setSearch(null);
	}

	return (
		<div className="flex max-w-xl flex-row items-center gap-2">
			<div className="relative flex-1">
				<HugeiconsIcon
					icon={SearchIcon}
					className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					strokeWidth={2}
				/>
				<Input
					value={search}
					onChange={(e) => setSearch(e.target.value || null)}
					placeholder={t("boards.toolbar.search")}
					className="h-8 pl-8 text-sm"
				/>
			</div>

			<div className="relative">
				{!!assignee && (
					<span className="absolute -top-0.5 -right-0.5 z-10 size-1.5 rounded-full bg-primary" />
				)}
				<Select
					value={assignee}
					defaultValue=""
					onValueChange={(v) => setAssignee(v || null)}
				>
					<SelectTrigger>
						<span
							data-slot="select-value"
							className="flex flex-1 items-center gap-2 text-left"
						>
							{selectedMember ? (
								<>
									<UserAvatar
										name={selectedMember.name ?? ""}
										avatarUrl={selectedMember.image}
										className="size-4"
									/>
									<span className="truncate">
										{selectedMember.name}
									</span>
								</>
							) : (
								t("boards.toolbar.allAssignees")
							)}
						</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">
							{t("boards.toolbar.allAssignees")}
						</SelectItem>
						{members.map((member) => (
							<SelectItem key={member.id} value={member.id}>
								<UserAvatar
									name={member.name ?? ""}
									avatarUrl={member.image}
									className="size-4"
								/>
								{member.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="relative">
				{!!priority && (
					<span className="absolute -top-0.5 -right-0.5 z-10 size-1.5 rounded-full bg-primary" />
				)}
				<Select
					value={priority}
					defaultValue=""
					onValueChange={(v) => setPriority(v || null)}
				>
					<SelectTrigger>
						<span
							data-slot="select-value"
							className="flex flex-1 items-center text-left"
						>
							{priority
								? t(`boards.task.priorities.${priority}`)
								: t("boards.toolbar.allPriorities")}
						</span>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">
							{t("boards.toolbar.allPriorities")}
						</SelectItem>
						{(
							Object.keys(PRIORITY_CONFIG) as Array<
								keyof typeof PRIORITY_CONFIG
							>
						).map((p) => (
							<SelectItem key={p} value={p}>
								{t(`boards.task.priorities.${p}`)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{hasActiveFilters && (
				<Button
					variant="ghost"
					size="sm"
					onClick={clearFilters}
					className="h-8 gap-1 text-muted-foreground"
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						className="size-3.5"
						strokeWidth={2}
					/>
					{t("boards.toolbar.clearFilters")}
				</Button>
			)}
		</div>
	);
}
