import { ORPCError } from "@orpc/server";
import { db, deleteTask as deleteTaskFn } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";

export const deleteTask = protectedProcedure
	.route({
		method: "DELETE",
		path: "/boards/tasks/{id}",
		tags: ["Boards"],
		summary: "Delete a task",
		description: "Permanently delete a task",
	})
	.input(z.object({ id: z.string() }))
	.handler(async ({ context: { user }, input: { id } }) => {
		const task = await db.task.findUnique({
			where: { id },
			select: { boardId: true },
		});

		if (!task) {
			throw new ORPCError("NOT_FOUND");
		}

		const { permissions } = await verifyBoardAccess(task.boardId, user.id);

		if (!permissions.canEditAnyTask) {
			throw new ORPCError("FORBIDDEN");
		}

		await deleteTaskFn(id);
		return { success: true };
	});
