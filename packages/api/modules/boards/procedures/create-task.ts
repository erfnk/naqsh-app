import { ORPCError } from "@orpc/server";
import {
	createTask as createTaskFn,
	db,
	getNextTaskPosition,
} from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { createTaskSchema } from "../types";

export const createTask = protectedProcedure
	.route({
		method: "POST",
		path: "/boards/{boardId}/tasks",
		tags: ["Boards"],
		summary: "Create a task",
		description: "Add a new task to a column",
	})
	.input(createTaskSchema)
	.handler(async ({ context: { user }, input }) => {
		const { permissions } = await verifyBoardAccess(input.boardId, user.id);

		if (!permissions.canCreateTasks) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify the column belongs to this board
		const column = await db.column.findUnique({
			where: { id: input.columnId },
			select: { boardId: true },
		});

		if (!column || column.boardId !== input.boardId) {
			throw new ORPCError("BAD_REQUEST");
		}

		const position = await getNextTaskPosition(input.columnId);

		return createTaskFn({
			...input,
			position,
			createdById: user.id,
		});
	});
