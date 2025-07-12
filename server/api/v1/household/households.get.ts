import { getHouseholds } from "~/server/utils/HouseHoldUtils";

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    });
  }

  handleCacheHeaders(event, { maxAge: 1 * 60 * 60, cacheControls: ['public'] });
  
  return await getHouseholds(user._id);
});
