import z from "zod";
import { DepartmentStatus } from "../enums";

export const createDepartmentSchema = z.object(
    {
        name: z.string(),
        status: z.enum([DepartmentStatus.ACTIVE, DepartmentStatus.INACTIVE]).optional(),
        description: z.string().optional(),
    }
);

export const updateDepartmentSchema = z.object(
    {
        name: z.string(),
        status: z.enum([DepartmentStatus.ACTIVE, DepartmentStatus.INACTIVE]).optional(),
        description: z.string().optional(),
    }
);
