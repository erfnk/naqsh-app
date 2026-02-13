import { ORPCError } from "@orpc/server";
import { db, updateColumn as updateColumnFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardOwner } from "../lib/board-access";
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

		await verifyBoardOwner(column.boardId, user.id);
		return updateColumnFn(input);
	});
