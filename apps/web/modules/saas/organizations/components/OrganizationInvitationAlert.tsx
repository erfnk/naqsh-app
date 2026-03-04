import { MailValidation01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { useTranslations } from "next-intl";

export function OrganizationInvitationAlert({
	className,
}: {
	className?: string;
}) {
	const t = useTranslations();
	return (
		<Alert variant="primary" className={className}>
			<HugeiconsIcon icon={MailValidation01Icon} strokeWidth={2} />
			<AlertTitle>{t("organizations.invitationAlert.title")}</AlertTitle>
			<AlertDescription>
				{t("organizations.invitationAlert.description")}
			</AlertDescription>
		</Alert>
	);
}
