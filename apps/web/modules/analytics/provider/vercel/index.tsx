"use client";

import { track } from "@vercel/analytics";
import { Analytics } from "@vercel/analytics/react";

export function AnalyticsScript() {
	return <Analytics />;
}

export function useAnalytics() {
	const trackEvent = (event: string, data?: Record<string, unknown>) => {
		track(event, data);
	};

	return {
		trackEvent,
	};
}
