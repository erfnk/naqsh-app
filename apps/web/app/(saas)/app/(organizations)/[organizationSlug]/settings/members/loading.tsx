import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
	return (
		<div className="flex flex-col gap-4">
			{/* Invite form */}
			<Card className="p-4 md:p-6">
				<div className="@container grid @xl:grid-cols-[min(100%/3,320px)_auto] grid-cols-1 @xl:gap-8 gap-4">
					<div className="flex shrink-0 flex-col gap-1.5">
						<Skeleton className="h-5 w-28" />
						<Skeleton className="h-3 w-44" />
					</div>
					<div className="flex flex-col gap-4">
						<Skeleton className="h-9 w-full rounded-md" />
						<div className="flex justify-end">
							<Skeleton className="h-9 w-20 rounded-md" />
						</div>
					</div>
				</div>
			</Card>

			{/* Members table */}
			<Card className="p-4 md:p-6">
				<div className="@container grid @xl:grid-cols-[min(100%/3,320px)_auto] grid-cols-1 @xl:gap-8 gap-4">
					<div className="flex shrink-0 flex-col gap-1.5">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-3 w-40" />
					</div>
					<div className="space-y-3">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="flex items-center gap-3">
								<Skeleton className="size-8 rounded-full" />
								<div className="flex-1 space-y-1">
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-3 w-36" />
								</div>
								<Skeleton className="h-8 w-20 rounded-md" />
							</div>
						))}
					</div>
				</div>
			</Card>
		</div>
	);
}
