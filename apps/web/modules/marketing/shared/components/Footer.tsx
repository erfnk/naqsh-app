import { Logo } from "@repo/ui";
import { config } from "@/config";

export function Footer() {
	return (
		<footer className="border-t py-8 text-foreground/60 text-sm">
			<div className="container">
				<div>
					<Logo className="opacity-70 grayscale" />
					<p className="mt-3 text-sm opacity-70">
						&copy; {new Date().getFullYear()} {config.appName}. All
						rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
