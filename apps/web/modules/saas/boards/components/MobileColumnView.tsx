"use client";

import { cn } from "@repo/ui";
import { useCallback, useRef, useState } from "react";
import { KanbanColumn } from "./KanbanColumn";

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

interface ColumnWithTasks {
	id: string;
	title: string;
	tasks: TaskData[];
}

interface MobileColumnViewProps {
	columns: ColumnWithTasks[];
	allColumns: { id: string; title: string }[];
	boardId: string;
	onTaskClick: (task: TaskData) => void;
	onReorder: (columnId: string, taskIds: string[]) => void;
	onMove: (taskId: string, targetColumnId: string, position: number) => void;
	onCreateTask: (columnId: string) => void;
}

const SWIPE_THRESHOLD = 50;

export function MobileColumnView({
	columns,
	allColumns,
	boardId,
	onTaskClick,
	onReorder,
	onMove,
	onCreateTask,
}: MobileColumnViewProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const touchStartX = useRef(0);
	const touchEndX = useRef(0);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
	}, []);

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			touchEndX.current = e.changedTouches[0].clientX;
			const deltaX = touchEndX.current - touchStartX.current;

			if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
				if (deltaX < 0 && activeIndex < columns.length - 1) {
					setActiveIndex((prev) => prev + 1);
				} else if (deltaX > 0 && activeIndex > 0) {
					setActiveIndex((prev) => prev - 1);
				}
			}
		},
		[activeIndex, columns.length],
	);

	if (columns.length === 0) return null;

	return (
		<div className="flex flex-col gap-3">
			{columns.length > 1 && (
				<div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
					{columns.map((col, idx) => (
						<button
							key={col.id}
							type="button"
							onClick={() => setActiveIndex(idx)}
							className={cn(
								"shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
								idx === activeIndex
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground",
							)}
						>
							{col.title}
						</button>
					))}
				</div>
			)}

			<div
				className="touch-manipulation overflow-hidden overscroll-contain"
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				<div
					className="flex transition-transform duration-300 ease-in-out"
					style={{
						transform: `translateX(-${activeIndex * 100}%)`,
					}}
				>
					{columns.map((col) => (
						<div key={col.id} className="w-full shrink-0 px-1">
							<KanbanColumn
								column={{ id: col.id, title: col.title }}
								tasks={col.tasks}
								allColumns={allColumns}
								boardId={boardId}
								className="w-full max-w-none"
								onTaskClick={onTaskClick}
								onReorder={onReorder}
								onMove={onMove}
								onCreateTask={onCreateTask}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
