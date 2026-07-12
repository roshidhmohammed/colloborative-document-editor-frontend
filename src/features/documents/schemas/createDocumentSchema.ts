import z from "zod";

export const createDocumentSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(1, "Please enter a topic")
    .min(3, "Topic must be at least 3 characters")
    .max(80, "Topic must be less than 80 characters"),
});