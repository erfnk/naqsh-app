import { Card } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
	return (
		<div className="flex flex-col gap-4">
			<Card className="p-4 md:p-6">
				<div className="@container grid @xl:grid-cols-[min(100%/3,320px)_auto] grid-cols-1 @xl:gap-8 gap-4">
					<div className="flex shrink-0 flex-col gap-1.5">
						<Skeleton className="h-5 w-36" />
						<Skeleton className="h-3 w-52" />
					</div>
					<div className="flex items-start">
						<Skeleton className="h-9 w-36 rounded-md" />
					</div>
				</div>
			</Card>
		</div>
	);
}
