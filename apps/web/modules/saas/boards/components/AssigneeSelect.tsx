"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@repo/ui";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { orpc } from "@shared/lib/orpc-query-utils";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface AssigneeSelectProps {
	value: string | null;
	onChange: (value: string | null) => void;
}

export function AssigneeSelect({ value, onChange }: AssigneeSelectProps) {
	const t = useTranslations();
	const { activeOrganization } = useActiveOrganization();

	const { data: members = [] } = useQuery(
		orpc.boards.members.list.queryOptions({
			input: { organizationId: activeOrganization?.id ?? "" },
			enabled: !!activeOrganization?.id,
		}),
	);

	const selectedMember = members.find((m) => m.id === value);
	const displayLabel =
		selectedMember?.name ?? t("boards.task.assigneePlaceholder");

	return (
		<Select
			value={value ?? "__none__"}
			onValueChange={(v) => onChange(v === "__none__" ? null : v)}
		>
			<SelectTrigger className="w-full">
				<span
					data-slot="select-value"
					className="flex flex-1 items-center gap-2 text-left"
				>
					{selectedMember ? (
						<>
							<UserAvatar
								name={selectedMember.name ?? ""}
								avatarUrl={selectedMember.image}
								className="size-5"
							/>
							<span className="truncate">
								{selectedMember.name}
							</span>
						</>
					) : (
						<span className="text-muted-foreground">
							{displayLabel}
						</span>
					)}
				</span>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="__none__">
					{t("boards.task.noAssignee")}
				</SelectItem>
				{members.map((member) => (
					<SelectItem key={member.id} value={member.id}>
						<UserAvatar
							name={member.name ?? ""}
							avatarUrl={member.image}
							className="size-5"
						/>
						<span className="truncate">{member.name}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
