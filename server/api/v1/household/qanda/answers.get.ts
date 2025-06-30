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
        return [];
    }

    const { questionId } = data;

    return await getAnswersByQuestionId(questionId);
});

const validation = z.object({
    questionId: z.string().min(24, "Household ID is required"),
});