import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
	return (
		<Card className="p-6">
			{/* Header */}
			<Skeleton className="mb-4 h-7 w-24" />

			{/* Search */}
			<Skeleton className="mb-4 h-9 w-full rounded-md" />

			{/* Table rows */}
			<div className="rounded-md border">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="flex items-center justify-between border-b p-3 last:border-b-0"
					>
						<div className="flex items-center gap-2">
							<Skeleton className="size-8 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-3 w-40" />
							</div>
						</div>
						<Skeleton className="size-9 rounded-md" />
					</div>
				))}
			</div>
		</Card>
	);
}
