import * as z from "zod";

export type User = {
  _id: string;
  mail: string;
  password_hash: number;
  name: string;
  lastname: string;
  last_login: string;
  last_IP: string;
  created_at: string;
  bild_reference?: string;
};

export type FrontEndUser = {
  _id: string;
  name: string;
  lastname: string;
  mail: string;
  bild_reference?: string;
}

export type Session = {
  _id: string;
  user_id: string;
  ip: string | undefined;
  expires_at: Date;
}

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  vorname: z.string().min(2),
  nachname: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  passwordRepeat: z.string().min(6),
  profilePicture: z.string(),
});