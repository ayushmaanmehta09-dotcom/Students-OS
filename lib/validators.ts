import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true });

export const deadlineCreateSchema = z.object({
  title: z.string().min(1).max(160),
  dueDate: isoDateTime,
  amountCents: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("EUR"),
  status: z.enum(["pending", "completed", "overdue"]).default("pending"),
  notes: z.string().max(2000).nullable().optional()
});

export const deadlinePatchSchema = deadlineCreateSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  { message: "At least one field is required" }
);

export const checklistCreateSchema = z.object({
  title: z.string().min(1).max(160),
  category: z.string().max(80).nullable().optional()
});

export const checklistPatchSchema = checklistCreateSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  { message: "At least one field is required" }
);

export const checklistItemCreateSchema = z.object({
  label: z.string().min(1).max(240),
  dueDate: isoDateTime.nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional()
});

export const checklistItemPatchSchema = z
  .object({
    label: z.string().min(1).max(240).optional(),
    isDone: z.boolean().optional(),
    dueDate: isoDateTime.nullable().optional(),
    sortOrder: z.number().int().nonnegative().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required"
  });

export const paymentLogCreateSchema = z.object({
  payee: z.string().min(1).max(120),
  amountCents: z.number().int().positive(),
  currency: z.string().length(3).default("EUR"),
  paidAt: isoDateTime,
  proofUrl: z.string().url().nullable().optional(),
  status: z.enum(["pending", "paid", "failed"]).default("pending")
});

export const paymentLogPatchSchema = paymentLogCreateSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  { message: "At least one field is required" }
);

export const emailDraftPatchSchema = z
  .object({
    subject: z.string().min(1).max(240).optional(),
    body: z.string().min(1).max(12000).optional(),
    status: z.enum(["draft", "final"]).optional(),
    tone: z.string().max(80).optional(),
    language: z.string().max(40).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required"
  });

export const aiEmailDraftRequestSchema = z.object({
  contextType: z.string().min(1).max(80),
  recipient: z.string().email().optional(),
  language: z.string().min(2).max(40).default("English"),
  tone: z.string().min(2).max(40).default("Professional"),
  prompt: z.string().min(10).max(5000)
});

export const feedbackCreateSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  message: z.string().min(1).max(2000),
  page: z.string().min(1).max(120)
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)
});

export const dateRangeSchema = z.object({
  from: isoDateTime.optional(),
  to: isoDateTime.optional()
});
