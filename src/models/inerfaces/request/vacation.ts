import { VacationStatus, VacationProgressStatus } from "../../enums";

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
    progressStatus?: VacationProgressStatus;
    rejectionReason?: string;
}

export interface IVacationStatusRequest {
    status: VacationStatus;
    rejectionReason?: string;
}