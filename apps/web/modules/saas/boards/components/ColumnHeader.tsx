"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@repo/ui";
import { useTranslations } from "next-intl";

interface ColumnHeaderProps {
	title: string;
	taskCount: number;
	onAddTask: () => void;
	canCreateTask?: boolean;
}

export function ColumnHeader({
	title,
	taskCount,
	onAddTask,
	canCreateTask = true,
}: ColumnHeaderProps) {
	const t = useTranslations();

	return (
		<div className="group flex items-center justify-between px-1.5 pb-2">
			<div className="flex items-center gap-2">
				<span className="size-2 rounded-full bg-muted-foreground/50" />
				<h3 className="font-medium text-sm">{title}</h3>
				<span className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs tabular-nums">
					{taskCount}
				</span>
			</div>
			{canCreateTask && (
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onAddTask}
					aria-label={t("boards.columns.addTask")}
					className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
				>
					<HugeiconsIcon
						icon={PlusSignIcon}
						className="size-4"
						strokeWidth={2}
					/>
				</Button>
			)}
		</div>
	);
}
