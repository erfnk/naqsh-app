import { ORPCError } from "@orpc/server";
import { getOrganizationMembersWithUsers } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";

export const listMembers = protectedProcedure
	.route({
		method: "GET",
		path: "/boards/members",
		tags: ["Boards"],
		summary: "List organization members",
		description:
			"List organization members for the assignee picker in boards",
	})
	.input(z.object({ organizationId: z.string() }))
	.handler(async ({ context: { user }, input: { organizationId } }) => {
		const membership = await verifyOrganizationMembership(
			organizationId,
			user.id,
		);

		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const members = await getOrganizationMembersWithUsers(organizationId);
		return members.map((m) => ({
			id: m.user.id,
			name: m.user.name,
			email: m.user.email,
			image: m.user.image,
			role: m.role,
		}));
	});
