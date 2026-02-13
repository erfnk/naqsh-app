import { Button } from "@repo/ui/components/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

export type PaginatioProps = {
	className?: string;
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	onChangeCurrentPage: (page: number) => void;
};

const Pagination = ({
	currentPage,
	totalItems,
	itemsPerPage,
	className,
	onChangeCurrentPage,
}: PaginatioProps) => {
	const numberOfPages = Math.ceil(totalItems / itemsPerPage);

	return (
		<div className={className}>
			<div className="flex items-center justify-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					disabled={currentPage === 1}
					onClick={() => onChangeCurrentPage(currentPage - 1)}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
				</Button>
				<span className="text-gray-500 text-sm">
					{currentPage * itemsPerPage - itemsPerPage + 1} -{" "}
					{currentPage * itemsPerPage > totalItems
						? totalItems
						: currentPage * itemsPerPage}{" "}
					of {totalItems}
				</span>
				<Button
					variant="ghost"
					size="icon"
					disabled={currentPage === numberOfPages}
					onClick={() => onChangeCurrentPage(currentPage + 1)}
				>
					<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
				</Button>
			</div>
		</div>
	);
};
Pagination.displayName = "Pagination";

export { Pagination };
