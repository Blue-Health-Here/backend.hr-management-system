import z from "zod";
import { DepartmentStatus } from "../enums";

export const createRRoleSchema = z.object(
    {
        name: z.string(),
        active: z.boolean().optional(),
    }
);

export const updateRoleSchema = z.object(
    {
        name: z.string(),
        active: z.boolean().optional(), 
    }
);
