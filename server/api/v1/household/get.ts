import { getHousehold } from "~/server/utils/HouseHoldUtils";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  console.log("User c2:" + user?.mail);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { data, error } = await getValidatedQuery(
    event,
    validation.safeParseAsync
  );

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: error.message,
    });
  }

  const { householdId } = data;

  const household = await getHousehold(householdId, user._id);

  if (!household) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Household not found or access denied",
    });
  }

  return household;
});

const validation = z.object({
  householdId: z.string().min(24, "Household ID is required"),
});
