"use client";

import { LanguageSquareIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { updateLocale } from "@i18n/lib/update-locale";
import { useLocalePathname, useLocaleRouter } from "@i18n/routing";
import type { Locale } from "@repo/i18n";
import { config } from "@repo/i18n/config";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

const { locales } = config;

export function LocaleSwitch({
	withLocaleInUrl = true,
}: {
	withLocaleInUrl?: boolean;
}) {
	const localeRouter = useLocaleRouter();
	const localePathname = useLocalePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentLocale = useLocale();
	const [value, setValue] = useState<string>(currentLocale);

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Language">
					<HugeiconsIcon
						icon={LanguageSquareIcon}
						className="size-4"
						strokeWidth={2}
					/>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(value) => {
						setValue(value);

						if (withLocaleInUrl) {
							localeRouter.replace(
								`${localePathname}?${searchParams.toString()}`,
								{
									locale: value,
								},
							);
						} else {
							updateLocale(value as Locale);
							router.refresh();
						}
					}}
				>
					{Object.entries(locales).map(([locale, { label }]) => {
						return (
							<DropdownMenuRadioItem key={locale} value={locale}>
								{label}
							</DropdownMenuRadioItem>
						);
					})}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
