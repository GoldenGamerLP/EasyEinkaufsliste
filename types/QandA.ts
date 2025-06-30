import * as z from 'zod';

type AnswerData = {
  _id?: string;
  questionId?: string;
  answer: {
    userId: string;
    answerId: string;
  }[];
};

type Question = {
  // Optional systemId for future use, e.g., for automatic question generation
  systemId?: string;
  householdId?: string;
  title: string;
  description: string;
  _id?: string;
  answers: AnswerPosibillity[];
  ttl: Date | string;
};

type AnswerPosibillity = {
  title: string;
  id: string;
  bild_refrence?: string;
};

const questionSChema = z.object({
  householdId: z.string().min(24, "Household ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  _id: z.string().optional(),
  answers: z.array(
    z.object({
      title: z.string().min(1, "Answer title is required"),
      id: z.string().min(1, "Answer ID is required"),
      bild_refrence: z.string().optional(),
    })
  ),
  ttl: z.number().int().positive("TTL must be a positive integer"),
});

const validation = z.object({
    householdId: z.string().min(24, "Household ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    answers: z.array(
        z.object({
            title: z.string().min(1, "Answer title is required"),
            id: z.string().min(1, "Answer ID is required"),
            bild_refrence: z.string().optional(),
        })
    ),
    ttl: z.number().int().positive("TTL must be a positive integer").default(5 * 60 * 1000),
});

export type { AnswerData, Question, AnswerPosibillity };
export { questionSChema, validation };