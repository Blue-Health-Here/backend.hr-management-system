import { z } from 'zod';

// Date string: YYYY-MM-DD
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

// Time string: HH:mm:ss (24-hour)
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, "Time must be in HH:mm:ss 24-hour format");

// Check-in schema
export const checkInSchema = z.object({
    // employeeId: z.string().uuid("Invalid employee ID format"),
    date: dateString, // Accepts date as string
    checkInTime: timeString, // Accepts time as string in 24-hour format
});

// Check-out schema
export const checkOutSchema = z.object({
    // employeeId: z.string().uuid("Invalid employee ID format"),
    date: dateString, // Accepts date as string
    checkOutTime: timeString, // Accepts time as string in 24-hour format
});

// Status schema
export const statusSchema = z.object({
    date: dateString, // Accepts date as string
});
