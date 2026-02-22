import { ORPCError } from "@orpc/server";
import { hasMinRole } from "@repo/auth/lib/roles";
import {
	getBoardForAccessCheck,
	getOrganizationMembership,
} from "@repo/database";
import type { BoardPermissions } from "../types";

interface BoardAccessResult {
	board: NonNullable<Awaited<ReturnType<typeof getBoardForAccessCheck>>>;
	boardRole: "owner" | "viewer";
	orgRole: string;
	permissions: BoardPermissions;
}

const FULL_PERMISSIONS: BoardPermissions = {
	canEditBoard: true,
	canDeleteBoard: true,
	canManageColumns: true,
	canCreateTasks: true,
	canEditAnyTask: true,
	canMoveAnyTask: true,
	canUpdateOwnTask: true,
	canComment: true,
	canFavorite: true,
	canView: true,
};

export async function verifyBoardAccess(
	boardId: string,
	userId: string,
): Promise<BoardAccessResult> {
	const board = await getBoardForAccessCheck(boardId);

	if (!board) {
		throw new ORPCError("NOT_FOUND");
	}

	if (board.createdById === userId) {
		const membership = await getOrganizationMembership(
			board.organizationId,
			userId,
		);
		return {
			board,
			boardRole: "owner",
			orgRole: membership?.role ?? "member",
			permissions: FULL_PERMISSIONS,
		};
	}

	if (board.visibility === "public") {
		const membership = await getOrganizationMembership(
			board.organizationId,
			userId,
		);
		if (membership) {
			const isAdmin = hasMinRole(membership.role, "admin");

			return {
				board,
				boardRole: "viewer",
				orgRole: membership.role,
				permissions: {
					canEditBoard: false,
					canDeleteBoard: false,
					canManageColumns: isAdmin,
					canCreateTasks: isAdmin,
					canEditAnyTask: isAdmin,
					canMoveAnyTask: isAdmin,
					canUpdateOwnTask: true,
					canComment: true,
					canFavorite: true,
					canView: true,
				},
			};
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
