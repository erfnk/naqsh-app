import { ORPCError } from "@orpc/server";
import { getTaskComment, updateTaskComment } from "@repo/database";
import { protectedProcedure } from "../../../orpc/procedures";
import { updateCommentSchema } from "../types";

export const updateComment = protectedProcedure
	.route({
		method: "PUT",
		path: "/boards/comments/{id}",
		tags: ["Boards"],
		summary: "Update a comment",
		description: "Edit a comment (author only)",
	})
	.input(updateCommentSchema)
	.handler(async ({ context: { user }, input }) => {
		const comment = await getTaskComment(input.id);

		if (!comment) {
			throw new ORPCError("NOT_FOUND");
		}

		if (comment.authorId !== user.id) {
			throw new ORPCError("FORBIDDEN");
		}

		return updateTaskComment({
			id: input.id,
			content: input.content,
		});
	});
