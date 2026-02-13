"use client";

import {
	EarthIcon,
	LockIcon,
	PlusSignIcon,
	StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Button,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui";
import { useActiveOrganization } from "@saas/organizations/hooks/use-active-organization";
import { UserAvatar } from "@shared/components/UserAvatar";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateBoardDialog } from "./CreateBoardDialog";

interface BoardItem {
	id: string;
	title: string;
	slug: string | null;
	visibility: string;
	createdBy: { id: string; name: string; image: string | null };
	favorites: { userId: string }[];
}

export function BoardSidebarContent() {
	const t = useTranslations();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const { activeOrganization } = useActiveOrganization();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const listQueryOptions = orpc.boards.list.queryOptions({
		input: { organizationId: activeOrganization?.id ?? "" },
	});

	const { data } = useQuery(listQueryOptions);

	const favoriteMutation = useMutation({
		...orpc.boards.toggleFavorite.mutationOptions(),
		onMutate: async ({ boardId }) => {
			await queryClient.cancelQueries(listQueryOptions);
			const previous = queryClient.getQueryData(
				listQueryOptions.queryKey,
			);

			// Optimistically toggle the favorite in the local cache
			if (previous) {
				type ListData = NonNullable<typeof previous>;
				type ListBoard = ListData["favorites"][number];

				const toggleFav = <T extends ListBoard>(board: T): T => {
					if (board.id !== boardId) {
						return board;
					}
					const isFav = board.favorites.length > 0;
					return {
						...board,
						favorites: isFav ? [] : [{ userId: "optimistic" }],
					};
				};

				queryClient.setQueryData(listQueryOptions.queryKey, {
					favorites: previous.favorites
						.map(toggleFav)
						.filter((b) => b.favorites.length > 0),
					recent: previous.recent.map(toggleFav),
					shared: previous.shared.map(toggleFav),
				});
			}

			return { previous };
		},
		onError: (_err, _input, ctx) => {
			if (ctx?.previous) {
				queryClient.setQueryData(
					listQueryOptions.queryKey,
					ctx.previous,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries(listQueryOptions);
		},
	});

	function handleToggleFavorite(boardId: string) {
		favoriteMutation.mutate({ boardId });
	}

	if (!activeOrganization) {
		return null;
	}

	const basePath = `/app/${activeOrganization.slug}`;
	const favorites = data?.favorites ?? [];
	const recent = data?.recent ?? [];
	const shared = data?.shared ?? [];

	function isBoardActive(board: BoardItem) {
		const boardPath = board.slug ?? board.id;
		return pathname.includes(`/boards/${boardPath}`);
	}

	function renderBoardItem(board: BoardItem, showOwner?: boolean) {
		const boardPath = board.slug ?? board.id;
		return (
			<SidebarMenuItem key={board.id}>
				<SidebarMenuButton
					render={<Link href={`${basePath}/boards/${boardPath}`} />}
					isActive={isBoardActive(board)}
				>
					<HugeiconsIcon
						icon={
							board.visibility === "public" ? EarthIcon : LockIcon
						}
						className="size-4 shrink-0 opacity-60"
						strokeWidth={2}
					/>
					<span className="truncate">
						{showOwner ? `${board.title}` : board.title}
					</span>
				</SidebarMenuButton>
				{showOwner ? (
					<SidebarMenuAction showOnHover={false}>
						<UserAvatar
							name={board.createdBy.name}
							avatarUrl={board.createdBy.image}
							className="size-5"
						/>
					</SidebarMenuAction>
				) : (
					<SidebarMenuAction
						showOnHover
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleToggleFavorite(board.id);
						}}
						aria-label={
							board.favorites.length > 0
								? t("boards.favorite.remove")
								: t("boards.favorite.add")
						}
					>
						<HugeiconsIcon
							icon={StarIcon}
							className={
								board.favorites.length > 0
									? "size-3.5 fill-primary text-primary transition-colors duration-150"
									: "size-3.5 transition-colors duration-150"
							}
							strokeWidth={2}
						/>
					</SidebarMenuAction>
				)}
			</SidebarMenuItem>
		);
	}

	return (
		<>
			<SidebarGroup>
				<SidebarGroupContent>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => setCreateDialogOpen(true)}
					>
						<HugeiconsIcon
							icon={PlusSignIcon}
							className="size-4"
							strokeWidth={2}
						/>
						{t("boards.sidebar.newBoard")}
					</Button>
				</SidebarGroupContent>
			</SidebarGroup>

			{favorites.length > 0 && (
				<SidebarGroup>
					<SidebarGroupLabel>
						{t("boards.sidebar.favorites")}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{favorites.map((board) => renderBoardItem(board))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			)}

			<SidebarGroup>
				<SidebarGroupLabel>
					{t("boards.sidebar.recent")}
				</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{recent.length > 0 ? (
							recent.map((board) => renderBoardItem(board))
						) : (
							<li className="flex flex-col items-center gap-1 py-4 text-center">
								<span className="text-xs text-muted-foreground/60">
									{t("boards.empty.title")}
								</span>
							</li>
						)}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			{shared.length > 0 && (
				<SidebarGroup>
					<SidebarGroupLabel>
						{t("boards.sidebar.shared")}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{shared.map((board) =>
								renderBoardItem(board, true),
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			)}

			<CreateBoardDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
			/>
		</>
	);
}
