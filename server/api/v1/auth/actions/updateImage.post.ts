import * as z from "zod";

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    });
  }

  const { success, data, error } = await readValidatedBody(
    event,
    z.object({
      image: z.string().min(1, "Image is required"),
    }).safeParseAsync
  );

  if (error) {
    throw createError({
      status: 400,
      message: error.message,
    });
  }

  // Update user image
  await updateUserImage(user._id, data.image);

  return { success: true, message: "Image updated successfully" };
});
