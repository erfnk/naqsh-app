import { ORPCError } from "@orpc/server";
import { reorderColumns as reorderColumnsFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { reorderColumnsSchema } from "../types";

export const reorderColumns = protectedProcedure
	.route({
		method: "POST",
		path: "/boards/{boardId}/columns/reorder",
		tags: ["Boards"],
		summary: "Reorder columns",
		description: "Update the position of columns in a board",
	})
	.input(reorderColumnsSchema)
	.handler(async ({ context: { user }, input }) => {
		const { permissions } = await verifyBoardAccess(input.boardId, user.id);

		if (!permissions.canManageColumns) {
			throw new ORPCError("FORBIDDEN");
		}

		await reorderColumnsFn(input.boardId, input.columnOrders);
		return { success: true };
	});
