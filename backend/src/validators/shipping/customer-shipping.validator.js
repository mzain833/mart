import { z } from "zod";

export const shippingQuoteSchema = z.object({
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().min(2).max(100),
  area: z.string().trim().min(2).max(150),
}).strict();