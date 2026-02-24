"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui/components/button";
import { DecryptedText } from "@shared/components/decrypted-text";
import { AnimatedGroup } from "@shared/components/motion-primitives/animated-group";
import { TextEffect } from "@shared/components/motion-primitives/text-effect";
import NextLink from "next/link";

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: "blur(12px)",
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring" as const,
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
};

interface HeroProps {
	className?: string;
}

function Hero({ className }: HeroProps) {
	return (
		<section className={cn("", className)}>
			<div className="relative mx-auto flex max-w-xl flex-col px-6 lg:block lg:max-w-6xl">
				<div className="mx-auto grid max-w-2xl gap-4 text-center">
					<div>
						<DecryptedText
							text="Open source and self-hostable"
							animateOn="view"
							revealDirection="start"
							sequential
							useOriginalCharsOnly={false}
							speed={70}
							className="font-mono text-muted-foreground text-sm"
						/>
					</div>
					<div>
						<TextEffect
							preset="fade-in-blur"
							speedSegment={0.3}
							as="h1"
							className="text-balance font-medium text-4xl"
						>
							Open-Source
						</TextEffect>
						<TextEffect
							preset="fade-in-blur"
							speedSegment={0.3}
							as="h1"
							className="text-balance font-medium text-4xl"
						>
							Project Management
						</TextEffect>
						<TextEffect
							preset="fade-in-blur"
							speedSegment={0.3}
							as="h1"
							className="text-balance font-medium text-4xl"
						>
							for Teams
						</TextEffect>
					</div>
					<TextEffect
						per="line"
						preset="fade-in-blur"
						speedSegment={0.3}
						delay={0.5}
						as="p"
						className="text-balance text-base text-muted-foreground"
					>
						An open source task and project management tool for
						teams who value simplicity. Kanban boards, priorities,
						and collaboration.
					</TextEffect>
					<AnimatedGroup
						variants={{
							container: {
								visible: {
									transition: {
										staggerChildren: 0.05,
										delayChildren: 0.75,
									},
								},
							},
							...transitionVariants,
						}}
						className="mt-4 flex items-center justify-center gap-4"
					>
						<Button asChild>
							<NextLink href="/app">Start for free</NextLink>
						</Button>
						<Button variant="outline" asChild>
							<NextLink
								href="https://github.com/erfnk/naqsh-app"
								target="_blank"
							>
								View on GitHub
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className="size-4"
									strokeWidth={3}
								/>
							</NextLink>
						</Button>
					</AnimatedGroup>
				</div>
			</div>
		</section>
	);
}

export { Hero };
