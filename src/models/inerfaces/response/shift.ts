import { ShiftType } from "../../enums";
import { ICompanyResponseBase } from "./response-base";

// Response Interface
export interface IShiftResponse extends ICompanyResponseBase {
    name: string;
    code: string;
    shiftType: ShiftType;
    startTime: string;
    endTime: string;
    workingHours: number; // Working hours in minutes
    breakDuration: number;
    order: number;
}