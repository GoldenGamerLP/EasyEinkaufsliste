import {
  createUser,
  createSessionCookie,
  registerLogin,
  usernameToUserIdentity,
} from "~/server/utils/authUtils";
import { registerSchema, UserRole } from "~/types/User";

export default defineEventHandler(async (event) => {
  const { success, data } = await readValidatedBody(event, registerSchema.safeParseAsync);

  if (!success) {
    throw createError({
      status: 400,
      statusText: "Invalid input data",
    });
  }

  const { email, password, vorname, nachname } = data;

  // Check if passwords match
  if (data.password !== data.passwordRepeat) {
    throw createError({
      status: 400,
      statusText: "Passwords do not match",
    });
  }

  // Check if user exists
  const existingUser = await usernameToUserIdentity(email);
  if (existingUser) {
    throw createError({
      status: 409,
      statusText: "Email already exists",
    });
  }

  // Create new user
  const result = await createUser(
    email,
    password,
    vorname,
    nachname
  );

  if (!result.insertedId) {
    throw createError({
      status: 500,
      statusText: "Failed to create user",
    });
  }

  // Create session and set cookie
  const session = await registerLogin(result.user, getRequestIP(event));
  const cookie = await createSessionCookie(session._id);
  setCookie(event, cookie.name, cookie.value, cookie.attributes);

  return { 
    success: true,
    user: {
      email: result.user.mail,
      name: result.user.name,
      lastname: result.user.lastname,
      roles: result.user.roles
    }
  };
});