import * as z from "zod";
import { createNewQuestion } from "~/server/utils/QuestionUtils";

export default defineEventHandler(async (event) => {
  const { data, error } = await readValidatedBody(event, validation.safeParseAsync);

  if(error) {
    throw createError({
        status: 500,
        message: error.message,
    });
  }

  const { householdId, generator } = data;

  return await createNewQuestion(generator, householdId);
});

const validation = z.object({
  householdId: z.string().min(24),
  generator: z.string(),
});
