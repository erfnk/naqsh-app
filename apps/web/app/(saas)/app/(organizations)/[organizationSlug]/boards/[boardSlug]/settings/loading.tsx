import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
	return (
		<>
			{/* PageHeader skeleton */}
			<div className="mb-8">
				<Skeleton className="h-8 w-36" />
				<Skeleton className="mt-1 h-4 w-56" />
			</div>

			<div className="flex flex-col gap-4">
				{/* Settings card */}
				<Card className="p-4 md:p-6">
					<div className="@container grid @xl:grid-cols-[min(100%/3,320px)_auto] grid-cols-1 @xl:gap-8 gap-4">
						<div className="flex shrink-0 flex-col gap-1.5">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-3 w-48" />
						</div>
						<div className="flex flex-col gap-4">
							<Skeleton className="h-9 w-full rounded-md" />
							<Skeleton className="h-20 w-full rounded-md" />
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-9 rounded-full" />
							</div>
							<div className="flex justify-end">
								<Skeleton className="h-9 w-16 rounded-md" />
							</div>
						</div>
					</div>
				</Card>

				{/* Danger zone card */}
				<Card className="p-4 md:p-6">
					<div className="@container grid @xl:grid-cols-[min(100%/3,320px)_auto] grid-cols-1 @xl:gap-8 gap-4">
						<div className="flex shrink-0 flex-col gap-1.5">
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-3 w-52" />
						</div>
						<div className="flex items-start">
							<Skeleton className="h-9 w-28 rounded-md" />
						</div>
					</div>
				</Card>
			</div>
		</>
	);
}
