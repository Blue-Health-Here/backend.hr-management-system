import z from "zod";

export const createEmployeeSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);

export const updateEmployeeSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);
