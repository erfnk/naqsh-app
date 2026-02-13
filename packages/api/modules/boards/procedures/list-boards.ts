import { ORPCError } from "@orpc/server";
import {
	getFavoriteBoards,
	getRecentBoards,
	getSharedBoards,
} from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";

export const listBoards = protectedProcedure
	.route({
		method: "GET",
		path: "/boards",
		tags: ["Boards"],
		summary: "List boards for sidebar",
		description:
			"Returns boards grouped into favorites, recent, and shared sections",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ context: { user }, input: { organizationId } }) => {
		const membership = await verifyOrganizationMembership(
			organizationId,
			user.id,
		);

		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const [favorites, recent, shared] = await Promise.all([
			getFavoriteBoards(user.id, organizationId),
			getRecentBoards(user.id, organizationId),
			getSharedBoards(user.id, organizationId),
		]);

		return { favorites, recent, shared };
	});
