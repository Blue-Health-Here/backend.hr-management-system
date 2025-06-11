import z from "zod";
import  { DesignationStatus } from "../enums";

export const createDesignationSchema = z.object(
    {
        title: z.string(),
        status: z.enum([DesignationStatus.ACTIVE, DesignationStatus.INACTIVE]).optional(),
        departmentId: z.string().optional(),
        description: z.string().optional(),
    }
);

export const updateDesignationSchema = z.object(
    {
        title: z.string(),
        status: z.enum([DesignationStatus.ACTIVE, DesignationStatus.INACTIVE]).optional(),
        departmentId: z.string().optional(),
        description: z.string().optional(),
    }
);
