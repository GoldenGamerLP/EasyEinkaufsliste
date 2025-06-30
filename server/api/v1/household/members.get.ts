import * as z from 'zod';

export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        });
    }

    const { data, error } = await getValidatedQuery(event, validation.safeParseAsync);

    if (error) {
        //Dont do anything if validation fails because the middleware always calls this endpoint even without a householdId
        return [];
    }

    const { householdId } = data;

    return await getHouseholdMembers(householdId);
});

const validation = z.object({
    householdId: z.string().min(24, "Household ID is required"),
});