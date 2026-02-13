import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "../lib";

export function Spinner({ className }: { className?: string }) {
	return (
		<HugeiconsIcon
			icon={Loading03Icon}
			className={cn("size-4 animate-spin text-primary", className)}
			strokeWidth={2}
		/>
	);
}
