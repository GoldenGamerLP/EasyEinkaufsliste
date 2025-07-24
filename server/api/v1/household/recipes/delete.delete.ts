import * as z from "zod";

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    throw createError({
      status: 405,
      message: "Not authenticated",
    });
  }

  const { data, error } = await readValidatedBody(
    event,
    validation.safeParseAsync
  );

  if (error) {
    throw createError({
      status: 405,
      message: error.message,
    });
  }

  const { recipeId } = data;

  return await deleteRecipe(recipeId);
});

const validation = z.object({
  recipeId: z.string().min(24),
});
