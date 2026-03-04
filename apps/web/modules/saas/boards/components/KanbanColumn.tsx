"use client";

import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { BoardPermissions } from "@repo/api/modules/boards/types";
import { cn } from "@repo/ui";
import { useTranslations } from "next-intl";
import {
	DropIndicator,
	GridList,
	GridListItem,
	useDragAndDrop,
} from "react-aria-components";
import { ColumnHeader } from "./ColumnHeader";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { KanbanTaskContextMenu } from "./KanbanTaskContextMenu";

interface TaskData {
	id: string;
	title: string;
	description: string | null;
	priority: string;
	position: number;
	columnId: string;
	assigneeId: string | null;
	assignee?: {
		id: string;
		name: string | null;
		image: string | null;
	} | null;
}

interface ColumnData {
	id: string;
	title: string;
}

interface KanbanColumnProps {
	column: ColumnData;
	tasks: TaskData[];
	allColumns: ColumnData[];
	boardId: string;
	className?: string;
	onTaskClick: (task: TaskData) => void;
	onReorder: (columnId: string, taskIds: string[]) => void;
	onMove: (taskId: string, targetColumnId: string, position: number) => void;
	onCreateTask: (columnId: string) => void;
	permissions?: BoardPermissions;
}

export function KanbanColumn({
	column,
	tasks,
	allColumns,
	boardId,
	className,
	onTaskClick,
	onReorder,
	onMove,
	onCreateTask,
	permissions,
}: KanbanColumnProps) {
	const canDrag = permissions?.canMoveAnyTask !== false;
	const { dragAndDropHooks } = useDragAndDrop({
		getItems: canDrag
			? (keys) =>
					[...keys].map((key) => ({
						"text/plain": key.toString(),
						"task-id": key.toString(),
					}))
			: () => [],
		acceptedDragTypes: canDrag ? ["task-id"] : [],
		getDropOperation: () => "move",
		onReorder: (e) => {
			const movedKeys = [...e.keys].map(String);
			const currentIds = tasks.map((t) => t.id);
			const filtered = currentIds.filter((id) => !movedKeys.includes(id));

			const targetKey = String(e.target.key);
			const targetIdx = filtered.indexOf(targetKey);

			if (targetIdx === -1) {
				return;
			}

			const insertIdx =
				e.target.dropPosition === "before" ? targetIdx : targetIdx + 1;

			filtered.splice(insertIdx, 0, ...movedKeys);
			onReorder(column.id, filtered);
		},
		onInsert: async (e) => {
			const items = await Promise.all(
				e.items
					.filter((item) => item.kind === "text")
					.map(async (item) => {
						const taskId = await (
							item as {
								getText: (type: string) => Promise<string>;
							}
						).getText("task-id");
						return taskId;
					}),
			);

			const targetKey = String(e.target.key);
			const currentIds = tasks.map((t) => t.id);
			const targetIdx = currentIds.indexOf(targetKey);
			const insertIdx =
				e.target.dropPosition === "before"
					? Math.max(0, targetIdx)
					: targetIdx + 1;

			for (const taskId of items) {
				onMove(taskId, column.id, insertIdx);
			}
		},
		onRootDrop: async (e) => {
			const items = await Promise.all(
				e.items
					.filter((item) => item.kind === "text")
					.map(async (item) => {
						const taskId = await (
							item as {
								getText: (type: string) => Promise<string>;
							}
						).getText("task-id");
						return taskId;
					}),
			);

			for (const taskId of items) {
				onMove(taskId, column.id, 0);
			}
		},
		renderDropIndicator: (target) => (
			<DropIndicator
				target={target}
				className="rounded-sm outline-dashed outline-2 outline-primary/60 -outline-offset-2"
			/>
		),
	});

	const t = useTranslations();

	return (
		<div
			className={cn(
				"group/column flex min-w-[320px] flex-1 flex-col",
				className,
			)}
		>
			<ColumnHeader
				title={column.title}
				taskCount={tasks.length}
				onAddTask={() => onCreateTask(column.id)}
				canCreateTask={permissions?.canCreateTasks !== false}
			/>

			<div className="flex flex-1 flex-col rounded-xl border border-border/50 bg-muted/30 p-2">
				<GridList
					aria-label={column.title}
					items={tasks}
					dragAndDropHooks={dragAndDropHooks}
					renderEmptyState={() => (
						<div className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground">
							<HugeiconsIcon
								icon={PlusSignIcon}
								className="size-4 opacity-40"
								strokeWidth={2}
							/>
							<span className="text-xs">
								{t("boards.columns.emptyState")}
							</span>
						</div>
					)}
					className="flex min-h-20 flex-1 select-none flex-col gap-2"
				>
					{(item) => (
						<GridListItem
							key={item.id}
							id={item.id}
							textValue={item.title}
							className={cn(
								"rounded-xl outline-none ring-primary focus-visible:ring-2",
								"data-dragging:opacity-50",
							)}
						>
							<KanbanTaskContextMenu
								taskId={item.id}
								boardId={boardId}
								currentColumnId={column.id}
								columns={allColumns}
								permissions={permissions}
								onEdit={() =>
									onTaskClick(
										// biome-ignore lint/style/noNonNullAssertion: <explanation >
										tasks.find((t) => t.id === item.id)!,
									)
								}
							>
								<KanbanTaskCard
									task={{
										id: item.id,
										title: item.title,
										priority: item.priority,
										assignee: item.assignee,
									}}
									onClick={() =>
										onTaskClick(
											// biome-ignore lint/style/noNonNullAssertion: <explanation >
											tasks.find(
												(t) => t.id === item.id,
											)!,
										)
									}
								/>
							</KanbanTaskContextMenu>
						</GridListItem>
					)}
				</GridList>
			</div>
		</div>
	);
}
