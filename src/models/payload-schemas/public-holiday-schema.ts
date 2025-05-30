// Zod Schemas for validation
import { z } from "zod";
import { PublicHolidayStatus } from "../enums";

export const createPublicHolidaySchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(255, "Name must be less than 255 characters")
        .trim(),
    date: z.string()
        .refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, "Invalid date format")
        .transform((date) => new Date(date)),
    type: z.string()
        .max(100, "Type must be less than 100 characters")
        .trim()
        .optional(),
    description: z.string()
        .trim()
        .optional(),
    whichCountryId: z.string().uuid()
        .optional(),
    departmentIds: z.array(z.string().uuid())
        .optional()
        .default([]),
    status: z.nativeEnum(PublicHolidayStatus)
        .default(PublicHolidayStatus.ACTIVE)
});

export const updatePublicHolidaySchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(255, "Name must be less than 255 characters")
        .trim()
        .optional(),
    date: z.string()
        .refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, "Invalid date format")
        .transform((date) => new Date(date))
        .optional(),
    type: z.string()
        .max(100, "Type must be less than 100 characters")
        .trim()
        .optional(),
    description: z.string()
        .trim()
        .optional(),
    whichCountryId: z.number()
        .int()
        .positive("Country ID must be a positive integer")
        .optional(),
    departmentIds: z.array(z.number().int().positive())
        .optional(),
    status: z.nativeEnum(PublicHolidayStatus)
        .optional()
});

export const bulkCreatePublicHolidaySchema = z.object({
    publicHolidays: z.array(createPublicHolidaySchema)
        .min(1, "At least one public holiday is required")
        .max(50, "Cannot create more than 50 public holidays at once")
});


// Type inference from schemas
export type CreatePublicHolidayInput = z.infer<typeof createPublicHolidaySchema>;
export type UpdatePublicHolidayInput = z.infer<typeof updatePublicHolidaySchema>;
export type BulkCreatePublicHolidayInput = z.infer<typeof bulkCreatePublicHolidaySchema>;