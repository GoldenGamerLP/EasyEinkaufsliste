import {
  createSessionCookie,
  registerLogin,
  verifyPassword,
} from "~/server/utils/authUtils";
import { loginSchema } from "~/types/User";

export default defineEventHandler(async (event) => {
  const { success, data } = await readValidatedBody(event, loginSchema.safeParseAsync);

  if (!success) {
    throw createError({
      status: 400,
      statusText: "Bad Request",
    });
  }

  const { email, password } = data;
  const user = await verifyPassword(email, password);

  if (!user) {
    throw createError({
      status: 401,
      statusText: "Invalid email or password",
    });
  }

  const session = await registerLogin(user, getRequestIP(event));
  const cookie = await createSessionCookie(session._id);
  setCookie(event, cookie.name, cookie.value, cookie.attributes);

  return { success: true };
});