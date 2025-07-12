import { ObjectId } from "mongodb";
import * as z from "zod";
import { addMemberToHousehold } from "~/server/utils/HouseHoldUtils";

export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if(!user) {
        throw createError({
            status: 400,
            message: "Not authenticated",
        });
    }

    const { data, error } = await readValidatedBody(event, validation.safeParseAsync);

    if(error) {
        throw createError({
            status: 400,
            message: error.message,
        })
    }

    const { userId, householdId } = data;


    return await addMemberToHousehold(householdId, userId);
});

const validation = z.object({
    householdId: z.string().min(24),
    userId: z.string().min(24),
})