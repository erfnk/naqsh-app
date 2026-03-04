import { cn } from "../lib";

export function Logo({
	withLabel = false,
	className,
}: {
	className?: string;
	withLabel?: boolean;
}) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div
				className={cn(
					"flex size-6 items-center justify-center rounded-md bg-primary p-1.5",
				)}
			>
				{/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation > */}
				<svg
					className="size-full text-primary-foreground"
					viewBox="0 0 330 330"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M314.244 15H330V315H316.054C240.894 315 180 254.084 180 178.898V149.292C180 75.1704 240.149 15 314.244 15Z"
						fill="currentColor"
					/>
					<path
						d="M15.7559 15H0V315H13.9461C89.1058 315 150 254.084 150 178.898V149.292C150 75.1704 89.851 15 15.7559 15Z"
						fill="currentColor"
					/>
				</svg>
			</div>
			{withLabel && <span className="font-semibold text-lg">Naqsh</span>}
		</div>
	);
}
