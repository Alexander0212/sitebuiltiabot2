import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Напишіть повідомлення")
    .max(2000, "Скоротіть повідомлення"),
  budgetHintUsd: z.number().int().min(30_000).max(2_000_000).optional(),
  goalHint: z.enum(["live", "invest"]).optional(),
});

export const handoffSchema = z.object({
  name: z.string().trim().min(2, "Вкажіть ім'я").max(80),
  phone: z
    .string()
    .trim()
    .min(10, "Вкажіть телефон")
    .max(20)
    .regex(/^[+\d\s()-]{10,20}$/, "Перевірте формат номера"),
  meetingType: z.enum(["online", "discuss", "office"]),
  slotId: z.string().trim().min(1).optional(),
  slotLabel: z.string().trim().min(1).optional(),
  date: z.string().trim().min(1).optional(),
  time: z.string().trim().min(1).optional(),
});
