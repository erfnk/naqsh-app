import { ORPCError } from "@orpc/server";
import { db, updateTask as updateTaskFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { updateTaskSchema } from "../types";

export const updateTask = protectedProcedure
	.route({
		method: "PUT",
		path: "/boards/tasks/{id}",
		tags: ["Boards"],
		summary: "Update a task",
		description: "Update task title, description, priority, or assignee",
	})
	.input(updateTaskSchema)
	.handler(async ({ context: { user }, input }) => {
		const task = await db.task.findUnique({
			where: { id: input.id },
			select: { boardId: true },
		});

		if (!task) {
			throw new ORPCError("NOT_FOUND");
		}

		await verifyBoardAccess(task.boardId, user.id);
		return updateTaskFn(input);
	});
