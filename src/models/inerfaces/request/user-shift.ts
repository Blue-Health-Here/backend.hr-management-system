// Request Interface
export interface IUserShiftRequest {
    userId: string;
    employeeId: string;
    shiftId: string;
    effectiveFrom: Date;
    effectiveTo?: Date; // NULL means ongoing
}