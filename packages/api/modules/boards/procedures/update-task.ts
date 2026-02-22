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
			select: { boardId: true, assigneeId: true },
		});

		if (!task) {
			throw new ORPCError("NOT_FOUND");
		}

		const { permissions } = await verifyBoardAccess(task.boardId, user.id);

		if (!permissions.canEditAnyTask) {
			if (
				permissions.canUpdateOwnTask &&
				task.assigneeId === user.id &&
				input.columnId
			) {
				return updateTaskFn({ id: input.id, columnId: input.columnId });
			}
			throw new ORPCError("FORBIDDEN");
		}

		return updateTaskFn(input);
	});
