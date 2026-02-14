"use client";

import type { BoardPermissions } from "@repo/api/modules/boards/types";
import { Spinner } from "@repo/ui";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { useKanbanMobileView } from "../hooks/use-kanban-mobile-view";
import { BoardToolbar } from "./BoardToolbar";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { KanbanColumn } from "./KanbanColumn";
import { MobileColumnView } from "./MobileColumnView";

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

interface KanbanBoardProps {
	boardId: string;
	organizationSlug: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
	const queryClient = useQueryClient();
	const showMobileView = useKanbanMobileView();

	const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [createDialogColumnId, setCreateDialogColumnId] = useState("");

	const [search] = useQueryState("search", parseAsString.withDefault(""));
	const [assigneeFilter] = useQueryState(
		"assignee",
		parseAsString.withDefault(""),
	);
	const [priorityFilter] = useQueryState(
		"priority",
		parseAsString.withDefault(""),
	);

	const boardQueryOptions = orpc.boards.get.queryOptions({
		input: { id: boardId },
	});

	const { data: board, isLoading } = useQuery({
		...boardQueryOptions,
		refetchInterval: 10_000,
		refetchIntervalInBackground: false,
	});

	const permissions = board?.permissions as BoardPermissions | undefined;

	const reorderMutation = useMutation({
		...orpc.boards.tasks.reorder.mutationOptions(),
		onMutate: async (input) => {
			await queryClient.cancelQueries(boardQueryOptions);
			const previous = queryClient.getQueryData(
				boardQueryOptions.queryKey,
			);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			queryClient.setQueryData(boardQueryOptions.queryKey, (old: any) => {
				if (!old) return old;
				return {
					...old,
					columns: old.columns.map((col: any) => {
						if (col.id !== input.columnId) return col;
						const taskMap = new Map(
							col.tasks.map((t: any) => [t.id, t]),
						);
						return {
							...col,
							tasks: input.taskOrders.map(
								(
									order: { id: string; position: number },
									idx: number,
								) => ({
									...(taskMap.get(order.id) ?? {}),
									position: idx,
								}),
							),
						};
					}),
				};
			});

			return { previous };
		},
		onError: (_err, _input, ctx) => {
			if (ctx?.previous) {
				queryClient.setQueryData(
					boardQueryOptions.queryKey,
					ctx.previous,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries(boardQueryOptions);
		},
	});

	const moveMutation = useMutation({
		...orpc.boards.tasks.move.mutationOptions(),
		onMutate: async (input) => {
			await queryClient.cancelQueries(boardQueryOptions);
			const previous = queryClient.getQueryData(
				boardQueryOptions.queryKey,
			);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			queryClient.setQueryData(boardQueryOptions.queryKey, (old: any) => {
				if (!old) return old;

				let movedTask: any;
				const newColumns = old.columns.map((col: any) => ({
					...col,
					tasks: col.tasks.filter((t: any) => {
						if (t.id === input.taskId) {
							movedTask = t;
							return false;
						}
						return true;
					}),
				}));

				if (!movedTask) return old;

				return {
					...old,
					columns: newColumns.map((col: any) => {
						if (col.id !== input.targetColumnId) return col;
						const newTasks = [...col.tasks];
						newTasks.splice(input.position, 0, {
							...movedTask,
							columnId: input.targetColumnId,
						});
						return {
							...col,
							tasks: newTasks.map((t: any, idx: number) => ({
								...t,
								position: idx,
							})),
						};
					}),
				};
			});

			return { previous };
		},
		onError: (_err, _input, ctx) => {
			if (ctx?.previous) {
				queryClient.setQueryData(
					boardQueryOptions.queryKey,
					ctx.previous,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries(boardQueryOptions);
		},
	});

	const handleReorder = useCallback(
		(columnId: string, taskIds: string[]) => {
			reorderMutation.mutate({
				columnId,
				taskOrders: taskIds.map((id, idx) => ({ id, position: idx })),
			});
		},
		[reorderMutation],
	);

	const handleMove = useCallback(
		(taskId: string, targetColumnId: string, position: number) => {
			moveMutation.mutate({ taskId, targetColumnId, position });
		},
		[moveMutation],
	);

	const handleTaskClick = useCallback((task: TaskData) => {
		setSelectedTask(task);
		setSheetOpen(true);
	}, []);

	const handleCreateTask = useCallback((columnId: string) => {
		setCreateDialogColumnId(columnId);
		setCreateDialogOpen(true);
	}, []);

	const columns = useMemo(
		() =>
			board?.columns
				.map(
					(col: {
						id: string;
						title: string;
						position: number;
						tasks: TaskData[];
					}) => ({
						...col,
						tasks: col.tasks
							.filter((task: TaskData) => {
								if (
									search &&
									!task.title
										.toLowerCase()
										.includes(search.toLowerCase())
								) {
									return false;
								}
								if (
									assigneeFilter &&
									task.assigneeId !== assigneeFilter
								) {
									return false;
								}
								if (
									priorityFilter &&
									task.priority !== priorityFilter
								) {
									return false;
								}
								return true;
							})
							.sort(
								(a: TaskData, b: TaskData) =>
									a.position - b.position,
							),
					}),
				)
				.sort(
					(a: { position: number }, b: { position: number }) =>
						a.position - b.position,
				) ?? [],
		[board?.columns, search, assigneeFilter, priorityFilter],
	);

	const allColumnData = useMemo(
		() =>
			columns.map((c: { id: string; title: string }) => ({
				id: c.id,
				title: c.title,
			})),
		[columns],
	);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!board) {
		return null;
	}

	return (
		<div className="flex min-w-0 flex-col gap-4">
			<BoardToolbar boardTitle={board.title} />

			{showMobileView ? (
				<MobileColumnView
					columns={columns}
					allColumns={allColumnData}
					boardId={boardId}
					onTaskClick={handleTaskClick}
					onReorder={handleReorder}
					onMove={handleMove}
					onCreateTask={handleCreateTask}
					permissions={permissions}
				/>
			) : (
				<div className="flex gap-4 overflow-x-auto pb-4 w-full">
					{columns.map(
						(col: {
							id: string;
							title: string;
							tasks: TaskData[];
						}) => (
							<KanbanColumn
								key={col.id}
								column={{ id: col.id, title: col.title }}
								tasks={col.tasks}
								allColumns={allColumnData}
								boardId={boardId}
								onTaskClick={handleTaskClick}
								onReorder={handleReorder}
								onMove={handleMove}
								onCreateTask={handleCreateTask}
								permissions={permissions}
							/>
						),
					)}
				</div>
			)}

			<EditTaskDialog
				task={selectedTask}
				boardId={boardId}
				columns={allColumnData}
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				permissions={permissions}
			/>

			<CreateTaskDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				boardId={boardId}
				columns={allColumnData}
				defaultColumnId={createDialogColumnId}
			/>
		</div>
	);
}
