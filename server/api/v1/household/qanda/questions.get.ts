import * as z from 'zod';
import { getHouseholdQuestions } from '~/server/utils/QuestionUtils';

export default defineEventHandler(async (event) => {
    const { data, error } = await getValidatedQuery(event, validation.safeParseAsync);

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message,
        });
    }

    const { householdId } = data;

    return await getHouseholdQuestions(householdId);
});

const validation = z.object({
    householdId: z.string().min(24, "Household ID is required"),
});