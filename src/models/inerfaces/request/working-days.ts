import { DayName } from "../../enums";


// Request Interface
export interface IWorkingDaysRequest {
    dayName: DayName; // Use enum for day names
    isWorkingDay?: boolean; // Optional with default true
    notes?: string; // Optional notes
}