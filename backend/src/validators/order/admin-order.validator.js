
import { z } from "zod";

export const updateAdminOrderStatusSchema = z.object({
  status: z.enum([
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ]),
  note: z.string().trim().max(500).optional().default(""),
}).strict();

export const cancelAdminOrderSchema = z.object({
  reason: z.string().trim().min(5).max(500),
}).strict();
