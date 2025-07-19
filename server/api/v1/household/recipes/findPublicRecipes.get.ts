import * as z from "zod";

export default defineEventHandler(async (event) => {
  const user = event.context.user;

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
      statusMessage: "Invalid query parameters",
      data: error.errors,
    });
  }

  const { search, householdId } = data;

  return await findPublicRecipes(search, householdId);
});

const validation = z.object({
  search: z.string(),
  householdId: z.string(),
  limit: z.coerce.number().optional().default(3),
});
