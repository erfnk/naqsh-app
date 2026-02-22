import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
	return (
		<div>
			{/* Back button */}
			<Skeleton className="mb-4 h-9 w-24 rounded-md" />

			{/* Organization form */}
			<Card className="p-4 md:p-6">
				<div className="@container grid @xl:grid-cols-[min(100%/3,320px)_auto] grid-cols-1 @xl:gap-8 gap-4">
					<div className="flex shrink-0 flex-col gap-1.5">
						<Skeleton className="h-5 w-28" />
						<Skeleton className="h-3 w-44" />
					</div>
					<div className="flex flex-col gap-4">
						<Skeleton className="h-9 w-full rounded-md" />
						<div className="flex justify-end">
							<Skeleton className="h-9 w-16 rounded-md" />
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
