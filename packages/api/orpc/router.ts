import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { boardsRouter } from "../modules/boards/router";
import { organizationsRouter } from "../modules/organizations/router";
import { usersRouter } from "../modules/users/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure.router({
	admin: adminRouter,
	boards: boardsRouter,
	organizations: organizationsRouter,
	users: usersRouter,
});

export type ApiRouterClient = RouterClient<typeof router>;
