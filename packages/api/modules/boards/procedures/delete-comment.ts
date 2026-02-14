import { ORPCError } from "@orpc/server";
import {
	deleteTaskComment,
	getTaskComment,
	getOrganizationMembership,
} from "@repo/database";
import { hasMinRole } from "@repo/auth/lib/roles";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { deleteCommentSchema } from "../types";

export const deleteComment = protectedProcedure
	.route({
		method: "DELETE",
		path: "/boards/comments/{id}",
		tags: ["Boards"],
		summary: "Delete a comment",
		description: "Delete a comment (author or org admin)",
	})
	.input(deleteCommentSchema)
	.handler(async ({ context: { user }, input }) => {
		const comment = await getTaskComment(input.id);

		if (!comment) {
			throw new ORPCError("NOT_FOUND");
		}

		if (comment.authorId !== user.id) {
			const { board } = await verifyBoardAccess(input.boardId, user.id);

			const membership = await getOrganizationMembership(
				board.organizationId,
				user.id,
			);

			if (!membership || !hasMinRole(membership.role, "admin")) {
				throw new ORPCError("FORBIDDEN");
			}
		}

		return deleteTaskComment(input.id);
	});
