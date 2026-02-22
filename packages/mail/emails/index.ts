import { EmailVerification } from "../emails/EmailVerification";
import { ForgotPassword } from "../emails/ForgotPassword";
import { MagicLink } from "../emails/MagicLink";
import { NewUser } from "../emails/NewUser";
import { OrganizationInvitation } from "../emails/OrganizationInvitation";

export const mailTemplates = {
	magicLink: MagicLink,
	forgotPassword: ForgotPassword,
	newUser: NewUser,
	organizationInvitation: OrganizationInvitation,
	emailVerification: EmailVerification,
} as const;
