import { hydrateUser } from "~/composable/auth";
import { hydrateHousehold } from "~/composable/household";
import { hydrateMembers } from "~/composable/members";

export default defineNuxtRouteMiddleware(async (to, from) => {
  await Promise.all([
    hydrateUser(to),
    hydrateHousehold(to),
    hydrateMembers(to),
  ]);
});
