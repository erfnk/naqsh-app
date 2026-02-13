import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import { config } from "@/config";

export const metadata: Metadata = {
	title: {
		absolute: config.appName,
		default: config.appName,
		template: `%s | ${config.appName}`,
	},
	appleWebApp: {
		title: "Naqsh App",
	},
};

export default function RootLayout({ children }: PropsWithChildren) {
	return children;
}
