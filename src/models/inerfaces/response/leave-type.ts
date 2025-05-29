import { GenderSpecific, LeaveTypeStatus } from "../../enums";
import { IDepartmentResponse } from "./department";

export interface ILeaveTypeResponse {
    departmentId?: number;
    name: string;
    code?: string;
    description?: string;
    maxDaysPerYear: number;
    maxConsecutiveDays: number;
    isPaid: boolean;
    requiresApproval: boolean;
    canBeCarriedForward: boolean;
    carryForwardLimit: number;
    genderSpecific: GenderSpecific;
    status: LeaveTypeStatus;
    department?: IDepartmentResponse;
}
