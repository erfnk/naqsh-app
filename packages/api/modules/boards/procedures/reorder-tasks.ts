import { ORPCError } from "@orpc/server";
import { db, reorderTasks as reorderTasksFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { reorderTasksSchema } from "../types";

export const reorderTasks = protectedProcedure
	.route({
		method: "POST",
		path: "/boards/columns/{columnId}/tasks/reorder",
		tags: ["Boards"],
		summary: "Reorder tasks",
		description: "Update the position of tasks within a column",
	})
	.input(reorderTasksSchema)
	.handler(async ({ context: { user }, input }) => {
		const column = await db.column.findUnique({
			where: { id: input.columnId },
			select: { boardId: true },
		});

		if (!column) {
			throw new ORPCError("NOT_FOUND");
		}

		await verifyBoardAccess(column.boardId, user.id);
		await reorderTasksFn(input.columnId, input.taskOrders);
		return { success: true };
	});
