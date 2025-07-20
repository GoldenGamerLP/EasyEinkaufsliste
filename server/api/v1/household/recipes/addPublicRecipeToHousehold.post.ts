import * as z from "zod";

export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if(!user) {
        throw createError({
            status: 400,
            message: "Not authenticated"
        })
    }

    const { data, error } = await readValidatedBody(event, validation.safeParseAsync);

    if(error) {
        throw createError({
            status: 400,
            message: error.message,
        })
    }

    const { recipeId, householdId } = data;

    return await addRecipeToHousehold(householdId, recipeId, user._id);
});

const validation = z.object({
    recipeId: z.string().min(24),
    householdId: z.string().min(24),
})