import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { boardsRouter } from "../modules/boards/router";
import { contactRouter } from "../modules/contact/router";
import { newsletterRouter } from "../modules/newsletter/router";
import { organizationsRouter } from "../modules/organizations/router";
import { paymentsRouter } from "../modules/payments/router";
import { usersRouter } from "../modules/users/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure.router({
	admin: adminRouter,
	boards: boardsRouter,
	newsletter: newsletterRouter,
	contact: contactRouter,
	organizations: organizationsRouter,
	users: usersRouter,
	payments: paymentsRouter,
});

export type ApiRouterClient = RouterClient<typeof router>;
