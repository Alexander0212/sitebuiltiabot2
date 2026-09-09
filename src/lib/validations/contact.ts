import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Вкажіть ім'я"),
  phone: z
    .string()
    .trim()
    .min(10, "Вкажіть номер телефону")
    .regex(/^[+\d\s()-]{10,20}$/, "Перевірте формат номера"),
  meetingType: z.enum(["online", "discuss", "office"], {
    message: "Оберіть формат зустрічі",
  }),
  lookingFor: z
    .string()
    .trim()
    .min(8, "Коротко опишіть, що шукаєте"),
  budget: z.string().trim().min(3, "Вкажіть орієнтовний бюджет"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
