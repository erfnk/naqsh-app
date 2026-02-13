import { cn } from "@repo/ui";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

export function EmailVerified({
	verified,
	className,
}: {
	verified: boolean;
	className?: string;
}) {
	const t = useTranslations();
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipContent>
					{verified
						? t("admin.users.emailVerified.verified")
						: t("admin.users.emailVerified.waiting")}
				</TooltipContent>
				<TooltipTrigger className={cn(className)}>
					{verified ? (
						<HugeiconsIcon icon={Tick02Icon} className="size-3 text-primary" strokeWidth={2} />
					) : (
						<HugeiconsIcon icon={Clock01Icon} className="size-3" strokeWidth={2} />
					)}
				</TooltipTrigger>
			</Tooltip>
		</TooltipProvider>
	);
}
