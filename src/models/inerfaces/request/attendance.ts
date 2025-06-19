import { AbsenceReasonType, AttendanceStatus, BreakType, PresentStatus,  } from "../../enums";


export interface IAttendanceRequest {
    userId: string;
    date: Date;
    checkInTime?: string;
    checkOutTime?: string;
    status: AttendanceStatus;
    presentStatus?: PresentStatus;
    workingHours?: number;
    lateMinutes?: number;
    notes?: string;
    location?: string;
    isRemote?: boolean;
    // Polymorphic fields for leave/holiday reference
    absenceReasonId?: string;      // ID of Vacation or PublicHoliday
    absenceReasonType?: AbsenceReasonType;  // Type to identify which entity
}

export interface ICheckInRequest {
    date: Date;
    checkInTime: string;
}

export interface ICheckOutRequest {
    date: Date;
    checkOutTime: string;
}

export interface IStatusRequest {
    date: Date;
}




export interface IBreakRequest {
    attendanceId: string;
    userId: string;
    breakType: BreakType;
    startTime: Date;
    endTime?: Date;
    notes?: string;
    location?: string;
}