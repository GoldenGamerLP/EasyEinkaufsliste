import { insertNewRecipe } from "~/server/utils/HouseHoldUtils";
import { RezeptErstellSchema } from "~/types/HouseHold";

export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        throw createError({
            status: 401,
            message: "Unauthorized",
        });
    }

    const { success, data, error } = await readValidatedBody(event, RezeptErstellSchema.safeParseAsync);

    if(error) {
        throw createError({
            status: 400,
            message: error.message,
        })
    }


    insertNewRecipe(data, data.householdId, user._id);
});