"use client";

import { AnalyticsScript } from "@analytics";
import { ProgressProvider } from "@bprogress/next/app";
import { Toaster } from "@repo/ui/components/toast";
import { ApiClientProvider } from "@shared/components/ApiClientProvider";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { config } from "@/config";

export function ClientProviders({ children }: PropsWithChildren) {
	return (
		<ApiClientProvider>
			<ProgressProvider
				height="4px"
				color="var(--color-primary)"
				options={{ showSpinner: false }}
				shallowRouting
				delay={250}
			>
				<ThemeProvider
					attribute="class"
					disableTransitionOnChange
					enableSystem
					defaultTheme={config.defaultTheme}
					themes={Array.from(config.enabledThemes)}
				>
					{children}

					<Toaster position="top-right" />
					<AnalyticsScript />
				</ThemeProvider>
			</ProgressProvider>
		</ApiClientProvider>
	);
}
