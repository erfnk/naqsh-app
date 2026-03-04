import { ORPCError } from "@orpc/server";
import {
	createColumn as createColumnFn,
	getNextColumnPosition,
} from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
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
		const { permissions } = await verifyBoardAccess(input.boardId, user.id);

		if (!permissions.canManageColumns) {
			throw new ORPCError("FORBIDDEN");
		}

		const position = await getNextColumnPosition(input.boardId);
		return createColumnFn({ ...input, position });
	});
