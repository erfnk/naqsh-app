import { ORPCError } from "@orpc/server";
import { getBoardById, upsertBoardAccess } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";

export const getBoard = protectedProcedure
	.route({
		method: "GET",
		path: "/boards/{id}",
		tags: ["Boards"],
		summary: "Get a board with columns and tasks",
		description:
			"Returns a full board including columns and tasks, and tracks access",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input: { id } }) => {
		const { role } = await verifyBoardAccess(id, user.id);

		const board = await getBoardById(id);

		if (!board) {
			throw new ORPCError("NOT_FOUND");
		}

		await upsertBoardAccess(id, user.id);

		return { ...board, userRole: role };
	});
