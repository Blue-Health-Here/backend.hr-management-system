import z from "zod";

export const createWorkingDaysSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);

export const updateWorkingDaysSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);
