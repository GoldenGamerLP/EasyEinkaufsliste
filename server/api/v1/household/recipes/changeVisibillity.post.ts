import * as z from "zod";
import { changeVisibillityFromRecipe } from "~/server/utils/recipeUtils";

export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Nicht autorisiert.",
        });
    }

    const { data, error} = await readValidatedBody(event, validaiton.safeParseAsync);

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message,
        });
    }

    const { recipeId, isPublic } = data;

    const res = await changeVisibillityFromRecipe(recipeId, isPublic);

    return { success: res };
});

const validaiton = z.object({
  recipeId: z.string().min(24, {
    message: "Die Rezept-ID ist erforderlich.",
  }),
  isPublic: z.boolean(),
});
