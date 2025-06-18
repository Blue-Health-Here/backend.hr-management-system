import z from "zod";
import { VacationStatus } from "../enums"; // Adjust import path as needed


// Date string: YYYY-MM-DD
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createVacationsSchema = z.object({
    fromDate: dateString,
    toDate: dateString,
    reason: z.string().min(3, "Reason must be at least 3 characters").max(255, "Reason must be at most 255 characters"),
    typeId: z.string().uuid(),
}).refine(
    (data) => data.fromDate <= data.toDate,
    { message: "fromDate must be before or equal to toDate", path: ["fromDate"] }
);

export const updateVacationsSchema = z.object({
    fromDate: dateString.optional(),
    toDate: dateString.optional(),
    reason: z.string().min(3).max(255).optional(),
    typeId: z.string().uuid().optional(),
}).refine(
    (data) =>
        !data.fromDate ||
        !data.toDate ||
        data.fromDate <= data.toDate,
    { message: "fromDate must be before or equal to toDate", path: ["fromDate"] }
);

export const updateStatusVacationsSchema = z.object({
  status: z
    .string()
    .refine(
      (val) => Object.values(VacationStatus).includes(val as VacationStatus),
      {
        message: `Invalid status. Must be one of: ${Object.values(VacationStatus).join(', ')}`,
      }
    ),
  rejectionReason: z.string().min(3).max(255).optional(),
});
