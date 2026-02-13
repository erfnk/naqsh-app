import { ORPCError } from "@orpc/server";
import { db, moveTask as moveTaskFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { moveTaskSchema } from "../types";

export const moveTask = protectedProcedure
	.route({
		method: "POST",
		path: "/boards/tasks/{taskId}/move",
		tags: ["Boards"],
		summary: "Move a task",
		description: "Move a task to a different column and/or position",
	})
	.input(moveTaskSchema)
	.handler(async ({ context: { user }, input }) => {
		const task = await db.task.findUnique({
			where: { id: input.taskId },
			select: { boardId: true },
		});

		if (!task) {
			throw new ORPCError("NOT_FOUND");
		}

		await verifyBoardAccess(task.boardId, user.id);

		// Verify target column belongs to the same board
		const targetColumn = await db.column.findUnique({
			where: { id: input.targetColumnId },
			select: { boardId: true },
		});

		if (!targetColumn || targetColumn.boardId !== task.boardId) {
			throw new ORPCError("BAD_REQUEST");
		}

		return moveTaskFn(input.taskId, input.targetColumnId, input.position);
	});
