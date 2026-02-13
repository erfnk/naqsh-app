import { ORPCError } from "@orpc/server";
import {
	getBoardBySlug,
	getOrganizationMembership,
	upsertBoardAccess,
} from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

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
	.handler(async ({ context: { user }, input: { slug, organizationSlug } }) => {
		const board = await getBoardBySlug(slug, organizationSlug);

		if (!board) {
			throw new ORPCError("NOT_FOUND");
		}

		// Verify the user is either the creator or a member of the board's organization
		if (board.createdById !== user.id) {
			const membership = await getOrganizationMembership(
				board.organizationId,
				user.id,
			);

			if (!membership) {
				throw new ORPCError("FORBIDDEN");
			}

			if (board.visibility !== "public") {
				throw new ORPCError("FORBIDDEN");
			}
		}

		await upsertBoardAccess(board.id, user.id);

		return { ...board, userRole: board.createdById === user.id ? "owner" as const : "viewer" as const };
	});
