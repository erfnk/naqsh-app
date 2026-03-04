import { cn } from "@repo/ui";

export function Footer() {
	return (
		<footer
			className={cn(
				"container max-w-6xl py-6 text-center text-foreground/60 text-xs",
			)}
		>
			<span>
				&copy; {new Date().getFullYear()} Naqsh. All rights reserved.
			</span>
		</footer>
	);
}
