import { h } from "vue";
import * as z from "zod";
export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
            message: "User not authenticated",
        });
    }

    const { data, error } = await getValidatedQuery(event, validation.safeParseAsync);

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: error.message,
        });
    }

    const { householdId, sort, search } = data;

    return await getRecipesForHousehold(householdId, search, sort);
});

const validation = z.object({
    search: z.string().optional(),
    sort: z.enum(["alphabetical", "mostliked", "created"]).optional().default("alphabetical"),
    householdId: z.string().min(24, "Household ID is required"),
});