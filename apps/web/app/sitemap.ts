import { config as i18nConfig } from "@repo/i18n/config";
import { getBaseUrl } from "@repo/utils";
import type { MetadataRoute } from "next";

const baseUrl = getBaseUrl();
const locales = Object.keys(i18nConfig.locales);

const staticMarketingPages = ["", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	return [
		...staticMarketingPages.flatMap((page) =>
			locales.map((locale) => ({
				url: new URL(`/${locale}${page}`, baseUrl).href,
				lastModified: new Date(),
			})),
		),
	];
}
