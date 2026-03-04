import { ORPCError } from "@orpc/server";
import { getTaskComments } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyBoardAccess } from "../lib/board-access";
import { listCommentsSchema } from "../types";

export const listComments = protectedProcedure
	.route({
		method: "GET",
		path: "/boards/{boardId}/tasks/{taskId}/comments",
		tags: ["Boards"],
		summary: "List comments",
		description: "Get all comments for a task",
	})
	.input(listCommentsSchema)
	.handler(async ({ context: { user }, input }) => {
		const { permissions } = await verifyBoardAccess(input.boardId, user.id);

		if (!permissions.canView) {
			throw new ORPCError("FORBIDDEN");
		}

		return getTaskComments(input.taskId);
	});
