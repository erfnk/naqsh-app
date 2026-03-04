import { z } from "zod";

export interface BoardPermissions {
	canEditBoard: boolean;
	canDeleteBoard: boolean;
	canManageColumns: boolean;
	canCreateTasks: boolean;
	canEditAnyTask: boolean;
	canMoveAnyTask: boolean;
	canUpdateOwnTask: boolean;
	canComment: boolean;
	canFavorite: boolean;
	canView: boolean;
}

export const BOARD_VISIBILITY = {
	private: "private",
	public: "public",
} as const;

export const TASK_PRIORITY = {
	low: "low",
	medium: "medium",
	high: "high",
	urgent: "urgent",
} as const;

export const createBoardSchema = z.object({
	title: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	organizationId: z.string(),
	visibility: z.enum(["private", "public"]).default("private"),
});

export const updateBoardSchema = z.object({
	id: z.string(),
	title: z.string().min(1).max(100).optional(),
	description: z.string().max(500).nullable().optional(),
	visibility: z.enum(["private", "public"]).optional(),
});

export const createTaskSchema = z.object({
	columnId: z.string(),
	boardId: z.string(),
	title: z.string().min(1).max(200),
	description: z.string().max(2000).optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
	assigneeId: z.string().optional(),
});

export const updateTaskSchema = z.object({
	id: z.string(),
	title: z.string().min(1).max(200).optional(),
	description: z.string().max(2000).nullable().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
	assigneeId: z.string().nullable().optional(),
	columnId: z.string().optional(),
});

export const moveTaskSchema = z.object({
	taskId: z.string(),
	targetColumnId: z.string(),
	position: z.number().int().min(0),
});

export const reorderTasksSchema = z.object({
	columnId: z.string(),
	taskOrders: z.array(
		z.object({
			id: z.string(),
			position: z.number().int().min(0),
		}),
	),
});

export const createColumnSchema = z.object({
	boardId: z.string(),
	title: z.string().min(1).max(100),
});

export const updateColumnSchema = z.object({
	id: z.string(),
	title: z.string().min(1).max(100).optional(),
});

export const reorderColumnsSchema = z.object({
	boardId: z.string(),
	columnOrders: z.array(
		z.object({
			id: z.string(),
			position: z.number().int().min(0),
		}),
	),
});

export const createCommentSchema = z.object({
	taskId: z.string(),
	boardId: z.string(),
	content: z.string().min(1).max(2000),
});

export const updateCommentSchema = z.object({
	id: z.string(),
	content: z.string().min(1).max(2000),
});

export const deleteCommentSchema = z.object({
	id: z.string(),
	boardId: z.string(),
});

export const listCommentsSchema = z.object({
	taskId: z.string(),
	boardId: z.string(),
});
