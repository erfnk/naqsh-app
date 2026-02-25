import { config as i18nConfig } from "@repo/i18n/config";
import { Button, Logo } from "@repo/ui";
import { SessionProvider } from "@saas/auth/components/SessionProvider";
import { Document } from "@shared/components/Document";
import { DitherBackground } from "@shared/components/dither-background";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { PropsWithChildren } from "react";
import { config } from "@/config";
import { LocaleLink } from "@/modules/i18n/routing";

const locales = Object.keys(i18nConfig.locales);

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function MarketingLayout({
	children,
	params,
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
	const { locale } = await params;

	setRequestLocale(locale);

	if (!locales.includes(locale as any)) {
		notFound();
	}

	const messages = await getMessages();

	return (
		<Document locale={locale}>
			<NextIntlClientProvider locale={locale} messages={messages}>
				<SessionProvider>
					<div className="relative grid min-h-svh content-between bg-background text-foreground">
						<div className="mask-[radial-gradient(ellipse_90%_70%_at_50%_40%,black_20%,transparent_100%)] absolute inset-0 h-full w-full">
							<DitherBackground
								waveColor={[0.58, 0.56, 0.53]}
								baseColor={[0.94, 0.93, 0.91]}
								disableAnimation={false}
								enableMouseInteraction={false}
								mouseRadius={0.3}
								colorNum={4}
								pixelSize={2}
								ditherBias={0.05}
								waveAmplitude={0.3}
								waveFrequency={3}
								waveSpeed={0.05}
							/>
						</div>
						<div className="pointer-events-none absolute inset-0 h-full bg-linear-to-b from-transparent via-background/90 to-transparent" />

						<header className="z-20 grid h-14 w-full items-center">
							<div className="container flex items-center justify-between">
								<LocaleLink
									href="/"
									className="block hover:no-underline active:no-underline"
								>
									<Logo />
								</LocaleLink>
								<Button size="sm" asChild>
									<Link href="/app">Login</Link>
								</Button>
							</div>
						</header>

						<main className="relative">{children}</main>

						<footer className="relative grid h-14 w-full items-center text-sm text-muted-foreground">
							<div className="container">
								<p>
									&copy; {new Date().getFullYear()}{" "}
									{config.appName}. All rights reserved.
								</p>
							</div>
						</footer>
					</div>
				</SessionProvider>
			</NextIntlClientProvider>
		</Document>
	);
}
