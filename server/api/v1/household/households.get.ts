import { getHouseholds } from "~/server/utils/HouseHoldUtils";

export default cachedEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    });
  }

  // Assuming you have a function to get households for the user
  console.log("Fetching households for user:", user._id);
  return await getHouseholds(user._id);
}, {
  maxAge: 1, // Cache for 1 second TODO: Adjust as needed
  swr: true, // Stale-while-revalidate
  getKey: (event) => event.context.user?._id || "no-user",
});
