"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@repo/ui";
import { useTranslations } from "next-intl";
import { PRIORITY_CONFIG } from "../lib/constants";

interface PriorityBadgeProps {
	priority: keyof typeof PRIORITY_CONFIG;
	className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
	const t = useTranslations();
	const config = PRIORITY_CONFIG[priority];

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
				config.className,
				className,
			)}
		>
			<HugeiconsIcon
				icon={config.icon}
				className="size-3"
				strokeWidth={2.5}
			/>
			{t(`boards.task.priorities.${priority}`)}
		</span>
	);
}
