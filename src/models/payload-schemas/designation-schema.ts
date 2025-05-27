import { title } from "process";
import z from "zod";

export const createDesignationSchema = z.object(
    {
        title: z.string(),
        description: z.string().optional(),
    }
);

export const updateDesignationSchema = z.object(
    {
        title: z.string(),
        description: z.string().optional(),
    }
);
