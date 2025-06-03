import { VacationStatus } from "../../enums";

// ========================= VACATION REQUEST INTERFACE =========================
export interface IVacationRequest {
    requestedBy: string;
    fromDate: Date;
    toDate: Date;
    reason: string;
    typeId: string;
    approvedBy?: string;
    approvedAt?: Date;
    status?: VacationStatus;
    rejectionReason?: string;
}