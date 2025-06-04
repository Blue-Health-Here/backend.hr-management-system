import { ShiftType } from "../../enums";

// Request Interface
export interface IShiftRequest {
    name: string;
    code: string;
    shiftType: ShiftType;
    startTime: string; // Format: "HH:mm:ss" e.g., "09:00:00"
    endTime: string; // Format: "HH:mm:ss" e.g., "17:00:00"
    breakDuration?: number; // Break duration in minutes, default 0
    order?: number; // Order/sequence of shift, default 0
}