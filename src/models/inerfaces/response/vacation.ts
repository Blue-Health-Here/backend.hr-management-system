import { VacationStatus } from "../../enums";
import { ICompanyResponseBase } from "./response-base";


// ========================= VACATION RESPONSE INTERFACE =========================
export interface IVacationResponse extends ICompanyResponseBase {
    requestedBy: string;
    fromDate: Date;
    toDate: Date;
    totalDays: number;
    reason: string;
    typeId: string;
    approvedBy?: string;
    approvedAt?: Date;
    status: VacationStatus;
    rejectionReason?: string;
    requestedByUser?: any;    // User who requested
    approvedByUser?: any;     // User who approved
    leaveType?: any;          // Leave type details
}