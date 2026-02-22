import { ArrowLeft } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn, Logo } from "@repo/ui";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { LocaleLink } from "@/modules/i18n/routing";

export function AuthWrapper({
	children,
	contentClass,
}: PropsWithChildren<{ contentClass?: string }>) {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div
				className={cn(
					"flex w-full max-w-sm flex-col gap-6",
					contentClass,
				)}
			>
				<Link href="/" className="flex items-center self-center">
					<Logo />
				</Link>
				{children}
				<LocaleLink
					href={"/"}
					className="flex items-center gap-1 self-center text-sm"
				>
					<HugeiconsIcon
						icon={ArrowLeft}
						className="size-4"
						strokeWidth={2}
					/>
					Back
				</LocaleLink>
			</div>
		</div>
	);
}
