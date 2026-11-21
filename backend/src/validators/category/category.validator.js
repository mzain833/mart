
import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const categoryFields = {
  name: z.string().trim().min(2).max(80),
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).optional(),
  image: z.string().trim().url().nullable().optional(),
};

export const createCategorySchema = z.object(categoryFields);

export const updateCategorySchema = z
  .object({
    ...categoryFields,
    isActive: z.boolean().optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });
