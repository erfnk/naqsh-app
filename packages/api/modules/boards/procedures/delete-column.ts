import { ORPCError } from "@orpc/server";
import { db, deleteColumn as deleteColumnFn } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";

export const deleteColumn = protectedProcedure
	.route({
		method: "DELETE",
		path: "/boards/columns/{id}",
		tags: ["Boards"],
		summary: "Delete a column",
		description: "Delete a column and all its tasks",
	})
	.input(z.object({ id: z.string() }))
	.handler(async ({ context: { user }, input: { id } }) => {
		const column = await db.column.findUnique({
			where: { id },
			select: { boardId: true },
		});

		if (!column) {
			throw new ORPCError("NOT_FOUND");
		}

		const { permissions } = await verifyBoardAccess(
			column.boardId,
			user.id,
		);

		if (!permissions.canManageColumns) {
			throw new ORPCError("FORBIDDEN");
		}

		await deleteColumnFn(id);
		return { success: true };
	});
