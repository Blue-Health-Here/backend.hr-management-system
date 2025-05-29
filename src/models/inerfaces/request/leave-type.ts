import { GenderSpecific, LeaveTypeStatus } from "../../enums";

export interface ILeaveTypeRequest {
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
}