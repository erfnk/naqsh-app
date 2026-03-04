import { db } from "../client";

// ── Slug Utilities ──────────────────────────────────────────────────────

export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.slice(0, 60);
}

async function generateUniqueSlug(
	title: string,
	organizationId: string,
): Promise<string> {
	const base = generateSlug(title) || "board";

	const existing = await db.board.findUnique({
		where: { organizationId_slug: { organizationId, slug: base } },
		select: { id: true },
	});

	if (!existing) {
		return base;
	}

	const suffix = Math.random().toString(36).slice(2, 6);
	return `${base}-${suffix}`;
}

// ── Board Access Check (lightweight) ────────────────────────────────────

export async function getBoardForAccessCheck(id: string) {
	return db.board.findUnique({
		where: { id },
		select: {
			id: true,
			organizationId: true,
			createdById: true,
			visibility: true,
		},
	});
}

// ── Board CRUD ──────────────────────────────────────────────────────────

export async function createBoard({
	title,
	description,
	organizationId,
	createdById,
	visibility = "private",
}: {
	title: string;
	description?: string;
	organizationId: string;
	createdById: string;
	visibility?: string;
}) {
	const slug = await generateUniqueSlug(title, organizationId);

	return db.$transaction(async (tx) => {
		const board = await tx.board.create({
			data: {
				title,
				slug,
				description,
				organizationId,
				createdById,
				visibility,
			},
		});

		const defaultColumns = [
			{ boardId: board.id, title: "To Do", position: 0 },
			{ boardId: board.id, title: "In Progress", position: 1 },
			{ boardId: board.id, title: "Done", position: 2 },
		];

		await tx.column.createMany({ data: defaultColumns });

		await tx.boardAccess.create({
			data: { boardId: board.id, userId: createdById },
		});

		return tx.board.findUniqueOrThrow({
			where: { id: board.id },
			include: {
				columns: { orderBy: { position: "asc" } },
				createdBy: { select: { id: true, name: true, image: true } },
			},
		});
	});
}

export async function getBoardById(id: string) {
	return db.board.findUnique({
		where: { id },
		include: {
			columns: {
				orderBy: { position: "asc" },
				include: {
					tasks: {
						orderBy: { position: "asc" },
						include: {
							assignee: {
								select: { id: true, name: true, image: true },
							},
							createdBy: {
								select: { id: true, name: true, image: true },
							},
						},
					},
				},
			},
			createdBy: { select: { id: true, name: true, image: true } },
			favorites: { select: { userId: true } },
		},
	});
}

export async function getBoardBySlug(slug: string, organizationSlug: string) {
	return db.board.findFirst({
		where: {
			slug,
			organization: { slug: organizationSlug },
		},
		include: {
			columns: {
				orderBy: { position: "asc" },
				include: {
					tasks: {
						orderBy: { position: "asc" },
						include: {
							assignee: {
								select: { id: true, name: true, image: true },
							},
							createdBy: {
								select: { id: true, name: true, image: true },
							},
						},
					},
				},
			},
			createdBy: { select: { id: true, name: true, image: true } },
			favorites: { select: { userId: true } },
		},
	});
}

export async function updateBoard(
	board: { id: string } & Partial<{
		title: string;
		description: string | null;
		visibility: string;
	}>,
) {
	const { id, ...data } = board;

	if (data.title) {
		const existing = await db.board.findUniqueOrThrow({
			where: { id },
			select: { organizationId: true },
		});
		const slug = await generateUniqueSlug(
			data.title,
			existing.organizationId,
		);
		return db.board.update({
			where: { id },
			data: { ...data, slug },
		});
	}

	return db.board.update({
		where: { id },
		data,
	});
}

export async function deleteBoard(id: string) {
	return db.board.delete({ where: { id } });
}

// ── Board Listings (for sidebar) ────────────────────────────────────────

export async function getFavoriteBoards(
	userId: string,
	organizationId: string,
) {
	return db.board.findMany({
		where: {
			organizationId,
			favorites: { some: { userId } },
			OR: [{ createdById: userId }, { visibility: "public" }],
		},
		include: {
			createdBy: { select: { id: true, name: true, image: true } },
			favorites: { where: { userId }, select: { userId: true } },
		},
		orderBy: { updatedAt: "desc" },
	});
}

export async function getRecentBoards(userId: string, organizationId: string) {
	return db.board.findMany({
		where: {
			organizationId,
			OR: [{ createdById: userId }, { visibility: "public" }],
		},
		include: {
			createdBy: { select: { id: true, name: true, image: true } },
			favorites: { where: { userId }, select: { userId: true } },
			accesses: {
				where: { userId },
				select: { lastAccessedAt: true },
			},
		},
		orderBy: [{ accesses: { _count: "desc" } }, { updatedAt: "desc" }],
		take: 20,
	});
}

export async function getSharedBoards(userId: string, organizationId: string) {
	return db.board.findMany({
		where: {
			organizationId,
			visibility: "public",
			NOT: { createdById: userId },
		},
		include: {
			createdBy: { select: { id: true, name: true, image: true } },
			favorites: { where: { userId }, select: { userId: true } },
		},
		orderBy: { updatedAt: "desc" },
	});
}

// ── Board Favorites ─────────────────────────────────────────────────────

export async function toggleBoardFavorite(boardId: string, userId: string) {
	const existing = await db.boardFavorite.findUnique({
		where: { boardId_userId: { boardId, userId } },
	});

	if (existing) {
		await db.boardFavorite.delete({
			where: { id: existing.id },
		});
		return { favorited: false };
	}

	await db.boardFavorite.create({
		data: { boardId, userId },
	});
	return { favorited: true };
}

// ── Board Access Tracking ───────────────────────────────────────────────

export async function upsertBoardAccess(boardId: string, userId: string) {
	return db.boardAccess.upsert({
		where: { boardId_userId: { boardId, userId } },
		update: { lastAccessedAt: new Date() },
		create: { boardId, userId },
	});
}

// ── Column CRUD ─────────────────────────────────────────────────────────

export async function createColumn({
	boardId,
	title,
	position,
}: {
	boardId: string;
	title: string;
	position: number;
}) {
	return db.column.create({
		data: { boardId, title, position },
	});
}

export async function updateColumn(
	column: { id: string } & Partial<{ title: string }>,
) {
	const { id, ...data } = column;
	return db.column.update({
		where: { id },
		data,
	});
}

export async function deleteColumn(id: string) {
	return db.column.delete({ where: { id } });
}

export async function reorderColumns(
	_boardId: string,
	columnOrders: { id: string; position: number }[],
) {
	return db.$transaction(
		columnOrders.map(({ id, position }) =>
			db.column.update({
				where: { id },
				data: { position },
			}),
		),
	);
}

export async function getNextColumnPosition(boardId: string) {
	const lastColumn = await db.column.findFirst({
		where: { boardId },
		orderBy: { position: "desc" },
		select: { position: true },
	});
	return (lastColumn?.position ?? -1) + 1;
}

// ── Task CRUD ───────────────────────────────────────────────────────────

export async function createTask({
	columnId,
	boardId,
	title,
	description,
	priority = "medium",
	position,
	assigneeId,
	createdById,
}: {
	columnId: string;
	boardId: string;
	title: string;
	description?: string;
	priority?: string;
	position: number;
	assigneeId?: string;
	createdById: string;
}) {
	return db.task.create({
		data: {
			columnId,
			boardId,
			title,
			description,
			priority,
			position,
			assigneeId,
			createdById,
		},
		include: {
			assignee: { select: { id: true, name: true, image: true } },
			createdBy: { select: { id: true, name: true, image: true } },
		},
	});
}

export async function getTaskById(id: string) {
	return db.task.findUnique({
		where: { id },
		include: {
			assignee: { select: { id: true, name: true, image: true } },
			createdBy: { select: { id: true, name: true, image: true } },
			column: { select: { id: true, title: true } },
		},
	});
}

export async function updateTask(
	task: { id: string } & Partial<{
		title: string;
		description: string | null;
		priority: string;
		assigneeId: string | null;
		columnId: string;
	}>,
) {
	const { id, ...data } = task;
	return db.task.update({
		where: { id },
		data,
		include: {
			assignee: { select: { id: true, name: true, image: true } },
			createdBy: { select: { id: true, name: true, image: true } },
		},
	});
}

export async function deleteTask(id: string) {
	return db.task.delete({ where: { id } });
}

export async function moveTask(
	taskId: string,
	targetColumnId: string,
	position: number,
) {
	return db.$transaction(async (tx) => {
		// Shift existing tasks in target column at or after the target position
		await tx.task.updateMany({
			where: {
				columnId: targetColumnId,
				position: { gte: position },
			},
			data: { position: { increment: 1 } },
		});

		// Move the task to the target column at the specified position
		return tx.task.update({
			where: { id: taskId },
			data: { columnId: targetColumnId, position },
			include: {
				assignee: { select: { id: true, name: true, image: true } },
				createdBy: { select: { id: true, name: true, image: true } },
			},
		});
	});
}

export async function reorderTasks(
	_columnId: string,
	taskOrders: { id: string; position: number }[],
) {
	return db.$transaction(
		taskOrders.map(({ id, position }) =>
			db.task.update({
				where: { id },
				data: { position },
			}),
		),
	);
}

export async function getNextTaskPosition(columnId: string) {
	const lastTask = await db.task.findFirst({
		where: { columnId },
		orderBy: { position: "desc" },
		select: { position: true },
	});
	return (lastTask?.position ?? -1) + 1;
}

// ── Organization Members (for assignee picker) ─────────────────────────

export async function getOrganizationMembersWithUsers(organizationId: string) {
	return db.member.findMany({
		where: { organizationId },
		include: {
			user: {
				select: { id: true, name: true, email: true, image: true },
			},
		},
	});
}

// ── Recent Tasks (for dashboard) ────────────────────────────────────────

export async function getRecentUserTasks(
	userId: string,
	organizationId: string,
	limit = 5,
) {
	return db.task.findMany({
		where: {
			assigneeId: userId,
			board: {
				organizationId,
				OR: [{ createdById: userId }, { visibility: "public" }],
			},
		},
		include: {
			board: { select: { id: true, title: true, slug: true } },
		},
		orderBy: { updatedAt: "desc" },
		take: limit,
	});
}
