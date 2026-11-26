
import { z } from "zod";

const shippingZoneFields = {
  name: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().min(2).max(100),
  area: z.string().trim().min(2).max(150),
  deliveryFee: z.number().int().min(0).max(1000000),
};

export const createShippingZoneSchema = z
  .object(shippingZoneFields)
  .strict();

export const updateShippingZoneSchema = z
  .object({
    ...shippingZoneFields,
    isActive: z.boolean(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });
