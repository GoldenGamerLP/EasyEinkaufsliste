import * as z from "zod";

export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        throw createError({
            status: 401,
            message: "Unauthorized",
        });
    }

    const { success, data, error } = await readValidatedBody(event, validation.safeParseAsync);

    if (error) {
        throw createError({
            status: 400,
            message: error.message,
        });
    }

    await createNewHousehold(data.name, user._id, data.members);
});

const validation = z.object({
    name: z.string().min(1, "Household name is required"),
    members: z.array(z.string().min(24, "Member ID must be 24 characters long")).optional().default([]),
});