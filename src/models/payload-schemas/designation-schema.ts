import { title } from "process";
import z from "zod";

export const createDesignationSchema = z.object(
    {
        title: z.string(),
        departmentId: z.string().optional(),
        description: z.string().optional(),
    }
);

export const updateDesignationSchema = z.object(
    {
        title: z.string(),
        departmentId: z.string().optional(),
        description: z.string().optional(),
    }
);
