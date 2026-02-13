import { Button } from "@repo/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { getTranslations } from "next-intl/server";
import { LocaleLink } from "@/modules/i18n/routing";

export default async function NotFoundPage() {
	const t = await getTranslations();

	return (
		<div className="flex h-full flex-col items-center justify-center">
			<h1 className="font-bold text-5xl">{t("notFound.code")}</h1>
			<p className="mt-2 text-2xl">{t("notFound.title")}</p>

			<Button render={<LocaleLink href="/app" />} className="mt-4">
				<HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 size-4" strokeWidth={2} />{" "}
				{t("notFound.goToHomepage")}
			</Button>
		</div>
	);
}
