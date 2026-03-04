import { Skeleton } from "@repo/ui/components/skeleton";

function TaskCardSkeleton({ lines = 1 }: { lines?: number }) {
	return (
		<div className="rounded-lg border bg-card p-3">
			<Skeleton className="h-4 w-[80%]" />
			{lines > 1 && <Skeleton className="mt-1.5 h-4 w-[50%]" />}
			<div className="mt-2 flex items-center justify-between">
				<Skeleton className="h-5 w-14 rounded-full" />
				<Skeleton className="size-5 rounded-full" />
			</div>
		</div>
	);
}

function ColumnSkeleton({
	titleWidth,
	cards,
}: {
	titleWidth: string;
	cards: number[];
}) {
	return (
		<div className="flex min-w-[320px] flex-1 flex-col">
			{/* Column header */}
			<div className="flex items-center gap-2 px-1.5 pb-2">
				<Skeleton className="size-2 rounded-full" />
				<Skeleton className={`h-4 ${titleWidth}`} />
				<Skeleton className="h-5 w-6 rounded-md" />
			</div>
			{/* Tasks container */}
			<div className="flex flex-1 flex-col gap-2 rounded-xl border border-border/50 bg-muted/30 p-2">
				{cards.map((lines, i) => (
					<TaskCardSkeleton key={i} lines={lines} />
				))}
			</div>
		</div>
	);
}

export default function Loading() {
	return (
		<div className="flex min-w-0 flex-col gap-4">
			{/* Toolbar */}
			<div className="flex max-w-xl items-center gap-2">
				<Skeleton className="h-8 w-48 rounded-md" />
				<Skeleton className="h-8 w-28 rounded-md" />
				<Skeleton className="h-8 w-28 rounded-md" />
			</div>

			{/* Columns */}
			<div className="flex w-full gap-4 overflow-x-auto pb-4">
				<ColumnSkeleton titleWidth="w-16" cards={[2, 1, 2]} />
				<ColumnSkeleton titleWidth="w-24" cards={[1, 2]} />
				<ColumnSkeleton titleWidth="w-12" cards={[1]} />
			</div>
		</div>
	);
}
