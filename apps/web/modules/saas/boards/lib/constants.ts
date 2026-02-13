import {
	Alert02Icon,
	ArrowDown01Icon,
	ArrowUp01Icon,
	MinusSignIcon,
} from "@hugeicons/core-free-icons";

export const PRIORITY_CONFIG = {
	low: {
		label: "Low",
		className: "bg-muted text-muted-foreground",
		icon: ArrowDown01Icon,
	},
	medium: {
		label: "Medium",
		className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
		icon: MinusSignIcon,
	},
	high: {
		label: "High",
		className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
		icon: ArrowUp01Icon,
	},
	urgent: {
		label: "Urgent",
		className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
		icon: Alert02Icon,
	},
} as const;

export const DEFAULT_COLUMNS = ["To Do", "In Progress", "Done"] as const;
