import { ORPCError } from "@orpc/server";
import { createBoard as createBoardFn } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyOrganizationMembership } from "../../organizations/lib/membership";
import { createBoardSchema } from "../types";

export const createBoard = protectedProcedure
	.route({
		method: "POST",
		path: "/boards",
		tags: ["Boards"],
		summary: "Create a new board",
		description:
			"Create a new board with default columns in the organization",
	})
	.input(createBoardSchema)
	.handler(async ({ context: { user }, input }) => {
		const membership = await verifyOrganizationMembership(
			input.organizationId,
			user.id,
		);

		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		return createBoardFn({
			...input,
			createdById: user.id,
		});
	});
