import z from "zod";
import { EmployeeStatus } from "../enums";

export const createEmployeeSchema = z.object(
    {
        user: z.object({
            userName: z.string(),
            password: z.string(),
            email: z.string().email(),
            firstName: z.string(),
            lastName: z.string(),
            middleName: z.string().optional(),
        }),
        employeeCode: z.string(),
        departmentId: z.string().uuid(),
        designationId: z.string().uuid(),
        joiningDate: z.string(),
        salary: z.number().optional(),
        status: z.nativeEnum(EmployeeStatus).optional(),
        probationEndDate: z.date().optional(),
        phoneNumber: z.string().optional(),
        emergencyContact: z.string().optional(),
    }
);

export const updateEmployeeSchema = z.object(
    {
        user: z.object({
            userName: z.string(),
            password: z.string().optional(),
            email: z.string().email(),
            firstName: z.string(),
            lastName: z.string(),
            middleName: z.string().optional(),
        }).optional(),
        employeeCode: z.string(),
        departmentId: z.string().uuid(),
        designationId: z.string().uuid(),
        joiningDate: z.string(),
        salary: z.number().optional(),
        status: z.nativeEnum(EmployeeStatus).optional(),
        probationEndDate: z.date().optional(),
        phoneNumber: z.string().optional(),
        emergencyContact: z.string().optional(),
    }
);
