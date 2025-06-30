import { questionSChema, validation } from "~/types/QandA";
import * as z from "zod";

export default defineEventHandler(async (event) => {
    const { data, error } = await readValidatedBody(event, validation.safeParseAsync);

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid request body",
            data: error.errors,
        });
    }

    const { householdId, title, description, answers, ttl } = data;

    return await createQuestion(householdId, title, description, answers, ttl);
});

