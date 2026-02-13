import { deleteBoard as deleteBoardFn } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardOwner } from "../lib/board-access";

export const deleteBoard = protectedProcedure
	.route({
		method: "DELETE",
		path: "/boards/{id}",
		tags: ["Boards"],
		summary: "Delete a board",
		description: "Permanently delete a board and all its contents",
	})
	.input(z.object({ id: z.string() }))
	.handler(async ({ context: { user }, input: { id } }) => {
		await verifyBoardOwner(id, user.id);
		await deleteBoardFn(id);
		return { success: true };
	});
