import { updateBoard as updateBoardFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardOwner } from "../lib/board-access";
import { updateBoardSchema } from "../types";

export const updateBoard = protectedProcedure
	.route({
		method: "PUT",
		path: "/boards/{id}",
		tags: ["Boards"],
		summary: "Update a board",
		description: "Update board title, description, or visibility",
	})
	.input(updateBoardSchema)
	.handler(async ({ context: { user }, input }) => {
		await verifyBoardOwner(input.id, user.id);
		return updateBoardFn(input);
	});
