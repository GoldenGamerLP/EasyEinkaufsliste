import * as z from "zod";
import { toggleFavoriteRecipe } from "~/server/utils/recipeUtils";

export default defineEventHandler(async (event) => {
    const { data, error } = await readValidatedBody(event, validation.safeParseAsync);

    if(error) {
        throw createError({
            status: 400,
            message: error.message,
        })
    }

    const { householdId, recipeId } = data;

    return await toggleFavoriteRecipe(householdId, recipeId);
});

const validation = z.object({
    householdId: z.string().min(24),
    recipeId: z.string().min(24),
})