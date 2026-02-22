import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
	return (
		<div>
			{/* PageHeader skeleton */}
			<div className="mb-8">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="mt-1 h-4 w-64" />
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Card 1: Recent Tasks */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Skeleton className="size-5 rounded" />
							<Skeleton className="h-5 w-28" />
						</div>
						<Skeleton className="h-4 w-52" />
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton
									key={i}
									className="h-10 w-full rounded-lg"
								/>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Card 2: Organization Members */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Skeleton className="size-5 rounded" />
							<Skeleton className="h-5 w-20" />
						</div>
						<Skeleton className="h-4 w-24" />
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="flex items-center gap-3"
								>
									<Skeleton className="size-8 rounded-full" />
									<div className="flex min-w-0 flex-1 items-center justify-between gap-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-6 w-14 rounded-full" />
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Card 3: Organization Settings */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Skeleton className="size-5 rounded" />
							<Skeleton className="h-5 w-40" />
						</div>
						<Skeleton className="h-4 w-56" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-4 w-32" />
					</CardContent>
					<CardFooter>
						<Skeleton className="h-9 w-32 rounded-md" />
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
