
import { z } from "zod";

const productSchema = z.object({
  sku: z.string().trim().min(3).max(40)
    .transform((value) => value.toUpperCase()),

  slug: z.string().trim().min(3).max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  name: z.string().trim().min(2).max(160),

  categoryId: z.string()
    .regex(/^[a-f\d]{24}$/i, "Invalid category ID.")
    .optional(),

  category: z.string().trim().min(2).max(80).optional(),

  image: z.string().trim().url(),

  images: z.array(
    z.object({
      url: z.string().trim().url(),
      publicId: z.string().trim().min(1).max(255),
    })
  ).max(8).optional(),

  price: z.number().finite().min(0),
  compareAtPrice: z.number().finite().min(0).nullable().optional(),
  badge: z.string().trim().max(60).nullable().optional(),
  description: z.string().trim().min(10).max(3000),
  stock: z.number().int().min(0),
  isNewArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const createProductSchema = productSchema
  .refine(
    (data) => Boolean(data.categoryId || data.category),
    {
      message: "Please select a product category.",
      path: ["categoryId"],
    }
  )
  .refine(
    (data) =>
      data.compareAtPrice == null ||
      data.compareAtPrice > data.price,
    {
      message: "Compare-at price must be greater than the selling price.",
      path: ["compareAtPrice"],
    }
  );

export const updateProductSchema = productSchema
  .partial()
  .omit({ sku: true })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  })
  .refine(
    (data) =>
      data.compareAtPrice === undefined ||
      data.compareAtPrice === null ||
      data.price === undefined ||
      data.compareAtPrice > data.price,
    {
      message: "Compare-at price must be greater than the selling price.",
      path: ["compareAtPrice"],
    }
  );
