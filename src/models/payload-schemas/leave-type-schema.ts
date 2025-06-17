// Zod Schemas for validation
import { z } from "zod";
import { GenderSpecific, LeaveTypeStatus } from "../enums";

export const createLeaveTypeSchema = z.object({
    departmentId: z.number().int().positive().optional(),
    name: z.string()
        .min(1, "Name is required")
        .max(255, "Name must be less than 255 characters")
        .trim(),
    code: z.string()
        .max(50, "Code must be less than 50 characters")
        .trim()
        .optional(),
    description: z.string()
        .trim()
        .optional(),
    maxDaysPerYear: z.number()
        .int()
        .min(0, "Max days per year must be non-negative")
        .max(365, "Max days per year cannot exceed 365")
        .default(0),
    maxConsecutiveDays: z.number()
        .int()
        .min(0, "Max consecutive days must be non-negative")
        .max(365, "Max consecutive days cannot exceed 365")
        .default(0),
    isPaid: z.boolean().default(true),
    requiresApproval: z.boolean().default(true),
    canBeCarriedForward: z.boolean().default(false),
    carryForwardLimit: z.number()
        .int()
        .min(0, "Carry forward limit must be non-negative")
        .max(365, "Carry forward limit cannot exceed 365")
        .default(0),
    genderSpecific: z.nativeEnum(GenderSpecific).default(GenderSpecific.ALL),
    status: z.nativeEnum(LeaveTypeStatus).default(LeaveTypeStatus.ACTIVE)
});

export const updateLeaveTypeSchema = z.object({
    departmentId: z.number().int().positive().optional(),
    name: z.string()
        .min(1, "Name is required")
        .max(255, "Name must be less than 255 characters")
        .trim()
        .optional(),
    code: z.string()
        .max(50, "Code must be less than 50 characters")
        .trim()
        .optional(),
    description: z.string()
        .trim()
        .optional(),
    maxDaysPerYear: z.number()
        .int()
        .min(0, "Max days per year must be non-negative")
        .max(365, "Max days per year cannot exceed 365")
        .optional(),
    maxConsecutiveDays: z.number()
        .int()
        .min(0, "Max consecutive days must be non-negative")
        .max(365, "Max consecutive days cannot exceed 365")
        .optional(),
    isPaid: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),
    canBeCarriedForward: z.boolean().optional(),
    carryForwardLimit: z.number()
        .int()
        .min(0, "Carry forward limit must be non-negative")
        .max(365, "Carry forward limit cannot exceed 365")
        .optional(),
    genderSpecific: z.nativeEnum(GenderSpecific).optional(),
    status: z.nativeEnum(LeaveTypeStatus).optional()
});

export const bulkCreateLeaveTypeSchema = z.object({
    leaveTypes: z.array(createLeaveTypeSchema).min(1, "At least one leave type is required")
});