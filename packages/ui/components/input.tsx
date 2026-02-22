import React from "react";
import { cn } from "../lib";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, type, ...props }: InputProps) => {
	return (
		<input
			type={type}
			className={cn(
				"flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-foreground/60 focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
};

export { Input };
