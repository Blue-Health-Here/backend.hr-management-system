import z from "zod";

export const createShiftSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);

export const updateShiftSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);
