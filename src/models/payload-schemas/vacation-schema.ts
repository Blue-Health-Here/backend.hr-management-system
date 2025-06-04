import z from "zod";

export const createVacationsSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);

export const updateVacationsSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);
