import { AbsenceReasonType, AttendanceStatus, BreakType,  } from "../../enums";


export interface IAttendanceRequest {
    employeeId: string;
    date: Date;
    checkInTime?: string;
    checkOutTime?: string;
    status: AttendanceStatus;
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
    // employeeId: string;
    date: Date;
    checkInTime: string;
}

export interface ICheckOutRequest {
    // employeeId: string;
    date: Date;
    checkOutTime: string;
}

export interface IStatusRequest {
    date: Date;
}




export interface IBreakRequest {
    attendanceId: string;
    employeeId: string;
    breakType: BreakType;
    startTime: Date;
    endTime?: Date;
    notes?: string;
    location?: string;
}