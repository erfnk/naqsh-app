import { reorderColumns as reorderColumnsFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardOwner } from "../lib/board-access";
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
		await verifyBoardOwner(input.boardId, user.id);
		await reorderColumnsFn(input.boardId, input.columnOrders);
		return { success: true };
	});
