import z from "zod";
import { DayName } from "../enums"; // Adjust import path as needed

export const createWorkingDaysSchema = z.object({
    dayName: z.nativeEnum(DayName, {
        errorMap: () => ({ message: "Day name must be a valid day of the week" })
    }),
    isWorkingDay: z.boolean().optional().default(true),
    notes: z.string().optional()
});

export const updateWorkingDaysSchema = z.object({
    dayName: z.nativeEnum(DayName, {
        errorMap: () => ({ message: "Day name must be a valid day of the week" })
    }).optional(),
    isWorkingDay: z.boolean().optional(),
    notes: z.string().optional()
});