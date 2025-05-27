import z from "zod";

export const createDepartmentSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);