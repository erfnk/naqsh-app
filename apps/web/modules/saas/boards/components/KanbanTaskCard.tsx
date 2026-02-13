"use client";

import { Card, cn } from "@repo/ui";
import { UserAvatar } from "@shared/components/UserAvatar";
import type { PRIORITY_CONFIG } from "../lib/constants";
import { PriorityBadge } from "./PriorityBadge";

interface TaskData {
	id: string;
	title: string;
	priority: string;
	assignee?: {
		id: string;
		name: string | null;
		image: string | null;
	} | null;
}

interface KanbanTaskCardProps {
	task: TaskData;
	onClick?: () => void;
	className?: string;
}

export function KanbanTaskCard({
	task,
	onClick,
	className,
}: KanbanTaskCardProps) {
	return (
		<Card
			className={cn(
				"min-w-0 cursor-pointer rounded-lg p-3 touch-manipulation",
				"duration-150",
				"hover:border-foreground/10",
				className,
			)}
			onClick={onClick}
		>
			<p className="line-clamp-2 text-sm font-medium leading-snug">
				{task.title}
			</p>
			<div className="mt-2 flex items-center justify-between gap-2">
				<PriorityBadge
					priority={task.priority as keyof typeof PRIORITY_CONFIG}
				/>
				{task.assignee && (
					<UserAvatar
						name={task.assignee.name ?? ""}
						avatarUrl={task.assignee.image}
						className="size-5"
					/>
				)}
			</div>
		</Card>
	);
}
