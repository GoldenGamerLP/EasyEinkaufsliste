import * as z from 'zod';

export default defineEventHandler(async (event) => {
    const { data, error } = await readValidatedBody(event, validation.safeParseAsync);

    if( error ) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid request body",
            data: error.errors,
        });
    }

    const user = event.context.user;

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        });
    }

    const { questionId, answer } = data;

    return await markAnswerByUser(user._id, questionId, answer);
});

const validation = z.object({
    questionId: z.string().min(24, "Question ID is required"),
    answer: z.string().min(1, "Answer is required"),
});