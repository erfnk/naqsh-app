import { getSession } from "@saas/auth/lib/server";
import { BoardSettingsForm } from "@saas/boards/components/BoardSettingsForm";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { orpc } from "@shared/lib/orpc-query-utils";
import { getServerQueryClient } from "@shared/lib/server";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();
	return {
		title: t("boards.settings.title"),
	};
}

export default async function BoardSettingsPage({
	params,
}: {
	params: Promise<{ organizationSlug: string; boardSlug: string }>;
}) {
	const { boardSlug, organizationSlug } = await params;
	const t = await getTranslations();
	const session = await getSession();

	if (!session?.user) {
		return notFound();
	}

	const queryClient = getServerQueryClient();

	try {
		const board = await queryClient.fetchQuery(
			orpc.boards.getBySlug.queryOptions({
				input: { slug: boardSlug, organizationSlug },
			}),
		);

		if (board.createdById !== session.user.id) {
			return notFound();
		}

		return (
			<>
				<PageHeader
					title={t("boards.settings.title")}
					subtitle={t("boards.settings.subtitle")}
				/>
				<BoardSettingsForm
					board={board}
					organizationSlug={organizationSlug}
				/>
			</>
		);
	} catch {
		return notFound();
	}
}
