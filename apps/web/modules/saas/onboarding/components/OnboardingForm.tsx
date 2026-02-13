"use client";

import { authClient } from "@repo/auth/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { useRouter } from "@shared/hooks/router";
import { clearCache } from "@shared/lib/cache";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { withQuery } from "ufo";
import { OnboardingStep1 } from "./OnboardingStep1";

export function OnboardingForm() {
	const t = useTranslations();
	const router = useRouter();
	const searchParams = useSearchParams();

	const stepSearchParam = searchParams.get("step");
	const redirectTo = searchParams.get("redirectTo");
	const onboardingStep = stepSearchParam
		? Number.parseInt(stepSearchParam, 10)
		: 1;

	// biome-ignore lint/correctness/noUnusedVariables: Will be used with more steps
	const setStep = (step: number) => {
		router.replace(
			withQuery(window.location.search ?? "", {
				step,
			}),
		);
	};

	const onCompleted = async () => {
		await authClient.updateUser({
			onboardingComplete: true,
		});

		await clearCache();
		router.replace(redirectTo ?? "/app");
	};

	const steps = [
		{
			component: <OnboardingStep1 onCompleted={() => onCompleted()} />,
		},
	];

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle>{t("onboarding.title")}</CardTitle>
				<CardDescription>{t("onboarding.message")}</CardDescription>
			</CardHeader>
			<CardContent>
				{steps.length > 1 && (
					<div className="mb-6 flex items-center gap-3">
						<Progress
							value={(onboardingStep / steps.length) * 100}
							className="h-2"
						/>
						<span className="shrink-0 text-foreground/60 text-xs">
							{t("onboarding.step", {
								step: onboardingStep,
								total: steps.length,
							})}
						</span>
					</div>
				)}

				{steps[onboardingStep - 1].component}
			</CardContent>
		</Card>
	);
}
