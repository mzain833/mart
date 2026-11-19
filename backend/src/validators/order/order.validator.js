
import { z } from "zod";

const customerSchema = z.object({
  fullName: z.string().trim().min(3).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(20),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(2).max(80),
  province: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(2).max(20),
}).strict();

const orderItemSchema = z.object({
  sku: z.string().trim().min(3).max(40).transform((value) =>
    value.toUpperCase()
  ),
  quantity: z.number().int().min(1).max(100),
}).strict();

export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  deliveryMethod: z.enum(["standard", "express"]),
  paymentMethod: z.literal("cod"),
}).strict();

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(5).max(500),
}).strict();

export const guestOrderConfirmationSchema = z.object({
  accessToken: z.string().regex(
    /^[a-f\d]{64}$/i,
    "Invalid guest order access token."
  ),
}).strict();
