import * as z from "zod";
import { updateMemberRole } from "~/server/utils/HouseHoldUtils";

const updateMemberRoleSchema = z.object({
  userId: z.string().min(24).max(24), // Assuming MongoDB ObjectId length
  householdId: z.string().min(24).max(24), // Assuming MongoDB ObjectId length
  role: z.enum(['READ', 'READ_WRITE', 'CREATOR']),
});

export default defineEventHandler(async (event) => {
    const { data, error } = await readValidatedBody(event, updateMemberRoleSchema.safeParseAsync);

    if (error) {
        throw createError({
            statusCode: 400,
            statusMessage: error.message,
        });
    }
    const { userId, householdId, role } = data;

    return await updateMemberRole(userId, householdId, role);
}); 
