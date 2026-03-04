import { ORPCError } from "@orpc/server";
import { createTaskComment } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { createCommentSchema } from "../types";

export const createComment = protectedProcedure
	.route({
		method: "POST",
		path: "/boards/{boardId}/comments",
		tags: ["Boards"],
		summary: "Create a comment",
		description: "Add a comment to a task",
	})
	.input(createCommentSchema)
	.handler(async ({ context: { user }, input }) => {
		const { permissions } = await verifyBoardAccess(input.boardId, user.id);

		if (!permissions.canComment) {
			throw new ORPCError("FORBIDDEN");
		}

		return createTaskComment({
			taskId: input.taskId,
			authorId: user.id,
			content: input.content,
		});
	});
