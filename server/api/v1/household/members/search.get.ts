import * as z from 'zod';
import { searchForUser } from '~/server/utils/authUtils';

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
        throw createError({
            statusCode: 400,
            statusMessage: error.message,
        });
    }

    const { userMail } = data;

    return await searchForUser(userMail);
});

const validation = z.object({
    userMail: z.string().min(1, "User email is required").max(100, "User email must be less than 100 characters"),
});