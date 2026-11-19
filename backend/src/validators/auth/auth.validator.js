
import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password is too long.");

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must contain at least 3 characters.")
    .max(80, "Full name is too long."),

  email: emailSchema,

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .refine(
      (value) => value.replace(/\D/g, "").length >= 10,
      "Enter a valid phone number."
    ),

  password: passwordSchema,

  confirmPassword: z.string().min(1, "Confirm your password."),
}).refine(
  (values) => values.password === values.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }
);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required.").max(128),
});


export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must contain at least 3 characters.")
    .max(80, "Full name is too long."),

  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.replace(/\D/g, "").length >= 10,
      "Enter a valid phone number."
    ),
});
