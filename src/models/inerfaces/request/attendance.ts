import { AbsenceReasonType, AttendanceStatus, BreakType,  } from "../../enums";


export interface IAttendanceRequest {
    employeeId: string;
    date: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
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


export interface IBreakRequest {
    attendanceId: string;
    employeeId: string;
    breakType: BreakType;
    startTime: Date;
    endTime?: Date;
    notes?: string;
    location?: string;
}