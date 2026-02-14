import { ORPCError } from "@orpc/server";
import { getBoardBySlug, upsertBoardAccess } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";

export const getBoardBySlugProcedure = protectedProcedure
	.route({
		method: "GET",
		path: "/boards/by-slug/{slug}",
		tags: ["Boards"],
		summary: "Get a board by slug",
		description:
			"Resolves a board by its slug within an organization, returns the board ID and data",
	})
	.input(
		z.object({
			slug: z.string(),
			organizationSlug: z.string(),
		}),
	)
	.handler(
		async ({ context: { user }, input: { slug, organizationSlug } }) => {
			const board = await getBoardBySlug(slug, organizationSlug);

			if (!board) {
				throw new ORPCError("NOT_FOUND");
			}

			const { boardRole, permissions } = await verifyBoardAccess(
				board.id,
				user.id,
			);

			await upsertBoardAccess(board.id, user.id);

			return { ...board, userRole: boardRole, permissions };
		},
	);
