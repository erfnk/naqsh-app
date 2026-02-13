import { ORPCError } from "@orpc/server";
import { getBoardForAccessCheck, getOrganizationMembership } from "@repo/database";

export async function verifyBoardAccess(boardId: string, userId: string) {
	const board = await getBoardForAccessCheck(boardId);

	if (!board) {
		throw new ORPCError("NOT_FOUND");
	}

	if (board.createdById === userId) {
		return { board, role: "owner" as const };
	}

	if (board.visibility === "public") {
		const membership = await getOrganizationMembership(
			board.organizationId,
			userId,
		);
		if (membership) {
			return { board, role: "viewer" as const };
		}
	}

	throw new ORPCError("FORBIDDEN");
}

export async function verifyBoardOwner(boardId: string, userId: string) {
	const board = await getBoardForAccessCheck(boardId);

	if (!board) {
		throw new ORPCError("NOT_FOUND");
	}

	if (board.createdById !== userId) {
		throw new ORPCError("FORBIDDEN");
	}

	return board;
}
