import { setRequestLocale } from "next-intl/server";
import { LocaleLink } from "@/modules/i18n/routing";

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className="container pt-24 pb-12 lg:pb-16">
			<div>
				<LocaleLink href={"/app"}>APP</LocaleLink>
			</div>
		</div>
	);
}
