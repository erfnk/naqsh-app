import { getSession } from "@saas/auth/lib/server";
import { KanbanBoard } from "@saas/boards/components/KanbanBoard";
import { orpc } from "@shared/lib/orpc-query-utils";
import { getServerQueryClient } from "@shared/lib/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

async function resolveBoard(
	boardSlug: string,
	organizationSlug: string,
	queryClient: ReturnType<typeof getServerQueryClient>,
) {
	const board = await queryClient.fetchQuery(
		orpc.boards.getBySlug.queryOptions({
			input: { slug: boardSlug, organizationSlug },
		}),
	);
	return board;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ organizationSlug: string; boardSlug: string }>;
}) {
	const { boardSlug, organizationSlug } = await params;
	const session = await getSession();

	if (!session?.user) {
		return { title: "Board" };
	}

	try {
		const queryClient = getServerQueryClient();
		const board = await resolveBoard(boardSlug, organizationSlug, queryClient);
		return { title: board.title };
	} catch {
		return { title: "Board" };
	}
}

export default async function BoardPage({
	params,
}: {
	params: Promise<{ organizationSlug: string; boardSlug: string }>;
}) {
	const { boardSlug, organizationSlug } = await params;
	const session = await getSession();

	if (!session?.user) {
		return notFound();
	}

	const queryClient = getServerQueryClient();

	let boardId: string;
	try {
		const board = await resolveBoard(boardSlug, organizationSlug, queryClient);
		boardId = board.id;

		// Seed the board-by-id cache with already-fetched data to avoid a second fetch
		queryClient.setQueryData(
			orpc.boards.get.queryOptions({ input: { id: boardId } }).queryKey,
			board,
		);
	} catch {
		return notFound();
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<KanbanBoard boardId={boardId} organizationSlug={organizationSlug} />
		</HydrationBoundary>
	);
}
