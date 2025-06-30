import { getRecipe } from "~/server/utils/HouseHoldUtils";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  const { data, error } = await getValidatedQuery(
    event,
    validation.safeParseAsync
  );

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    });
  }

  const { recipeId } = data;

  return await getRecipe(recipeId);
});

const validation = z.object({
  recipeId: z.string().min(1, {
    message: "Die Rezept-ID ist erforderlich.",
  }),
});
