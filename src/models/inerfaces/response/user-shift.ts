import { ICompanyResponseBase } from "./response-base";

// Response Interface
export interface IUserShiftResponse extends ICompanyResponseBase {
    userId: string;
    employeeId?: string;
    shiftId: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    user: any; // User response object
    employee?: any; // Employee response object
    shift: any; // Shift response object
}