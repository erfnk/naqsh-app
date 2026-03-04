import { toggleBoardFavorite } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";

export const toggleFavorite = protectedProcedure
	.route({
		method: "POST",
		path: "/boards/{boardId}/favorite",
		tags: ["Boards"],
		summary: "Toggle board favorite",
		description: "Add or remove a board from the user's favorites",
	})
	.input(z.object({ boardId: z.string() }))
	.handler(async ({ context: { user }, input: { boardId } }) => {
		await verifyBoardAccess(boardId, user.id);
		return toggleBoardFavorite(boardId, user.id);
	});
