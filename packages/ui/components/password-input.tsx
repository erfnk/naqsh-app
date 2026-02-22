"use client";

import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import { Input } from "./input";

export function PasswordInput({
	className,
	...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
	const [showPassword, setShowPassword] = React.useState(false);

	return (
		<div className={`relative ${className}`}>
			<Input
				type={showPassword ? "text" : "password"}
				className="pr-10"
				{...props}
			/>
			<button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary text-xl"
			>
				{showPassword ? (
					<HugeiconsIcon
						icon={ViewOffIcon}
						className="size-4"
						strokeWidth={2}
					/>
				) : (
					<HugeiconsIcon
						icon={ViewIcon}
						className="size-4"
						strokeWidth={2}
					/>
				)}
			</button>
		</div>
	);
}
