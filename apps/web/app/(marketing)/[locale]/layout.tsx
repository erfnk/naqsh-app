import { config as i18nConfig } from "@repo/i18n/config";
import { Logo } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { SessionProvider } from "@saas/auth/components/SessionProvider";
import { Document } from "@shared/components/Document";
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
					<div className="min-h-svh p-4 md:p-8">
						<section className="relative flex min-h-[calc(100vh-32px)] flex-col justify-between rounded-3xl bg-white/90 py-4 md:min-h-[calc(100vh-64px)]">
							{/* Background Pattern - only for hero section */}
							{/* <div
								className="absolute inset-0 hidden overflow-hidden md:block"
								style={{
									maskImage:
										"radial-gradient(ellipse 150% 200% at 100% 50%, black 0%, black 25%, transparent 65%)",
									WebkitMaskImage:
										"radial-gradient(ellipse 150% 200% at 100% 50%, black 0%, black 25%, transparent 65%)",
								}}
							>
								<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--background)_1px,transparent_1px),linear-gradient(to_bottom,var(--background)_1px,transparent_1px)] bg-size-[24px_24px]" />
							</div> */}
							<header className="relative w-full py-4 lg:py-8">
								<div className="container flex items-center justify-between">
									<LocaleLink
										href="/"
										className="block hover:no-underline active:no-underline"
									>
										<Logo />
									</LocaleLink>
									<Button size="sm" asChild>
										<Link href="/app">Start</Link>
									</Button>
								</div>
							</header>

							<main>{children}</main>

							<footer className="relative py-4 text-muted-foreground text-sm lg:py-8">
								<div className="container">
									<p>
										&copy; {new Date().getFullYear()}{" "}
										{config.appName}. All rights reserved.
									</p>
								</div>
							</footer>
						</section>
					</div>
				</SessionProvider>
			</NextIntlClientProvider>
		</Document>
	);
}
