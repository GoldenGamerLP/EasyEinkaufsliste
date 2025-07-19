import * as z from "zod";
import { getRecipe } from "~/server/utils/recipeUtils";

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

  const recipe = await getRecipe(recipeId);

  if (!recipe) {
    throw createError({
      statusCode: 404,
      statusMessage: "Rezept nicht gefunden.",
    });
  }

  const user = event.context.user;

  if(!recipe.isPublic) {
    if(!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Nicht autorisiert.",
      });
    }

    const isInHousehold = await getHousehold(recipe.householdId, user._id);

    if(!isInHousehold) {
      throw createError({
        statusCode: 403,
        statusMessage: "Zugriff verweigert. Du bist nicht im Haushalt dieses Rezepts.",
      });
    }
  }

  handleCacheHeaders(event, { maxAge: 1 * 60 * 60, cacheControls: ['public'] });
  return recipe;
});

const validation = z.object({
  recipeId: z.string().min(1, {
    message: "Die Rezept-ID ist erforderlich.",
  }),
});
