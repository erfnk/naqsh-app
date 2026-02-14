import { ORPCError } from "@orpc/server";
import { db, updateColumn as updateColumnFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { updateColumnSchema } from "../types";

export const updateColumn = protectedProcedure
	.route({
		method: "PUT",
		path: "/boards/columns/{id}",
		tags: ["Boards"],
		summary: "Update a column",
		description: "Update a column title",
	})
	.input(updateColumnSchema)
	.handler(async ({ context: { user }, input }) => {
		const column = await db.column.findUnique({
			where: { id: input.id },
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

		return updateColumnFn(input);
	});
