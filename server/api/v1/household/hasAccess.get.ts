import { hasAccessToHousehold } from "~/server/utils/HouseHoldUtils";
import * as z from "zod";

export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        throw createError({
            status: 401,
            message: "Unauthorized",
        });
    }

    const { error, data } = await getValidatedQuery(event, validation.safeParseAsync);

    if (error) {
        throw createError({
            status: 400,
            message: error.message,
        });
    }

    // Assuming you have a function to check access
    const hasAccess = await hasAccessToHousehold(user._id, data.householdId);

    return { hasAccess };
});

const validation = z.object({
    householdId: z.string().min(24).max(24)
});