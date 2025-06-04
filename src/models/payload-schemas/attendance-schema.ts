import z from "zod";

export const createAttendanceSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);

export const updateAttendanceSchema = z.object(
    {
        name: z.string(),
        description: z.string().optional(),
    }
);
