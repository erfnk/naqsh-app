import {
	createColumn as createColumnFn,
	getNextColumnPosition,
} from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardOwner } from "../lib/board-access";
import { createColumnSchema } from "../types";

export const createColumn = protectedProcedure
	.route({
		method: "POST",
		path: "/boards/{boardId}/columns",
		tags: ["Boards"],
		summary: "Create a column",
		description: "Add a new column to a board",
	})
	.input(createColumnSchema)
	.handler(async ({ context: { user }, input }) => {
		await verifyBoardOwner(input.boardId, user.id);
		const position = await getNextColumnPosition(input.boardId);
		return createColumnFn({ ...input, position });
	});
