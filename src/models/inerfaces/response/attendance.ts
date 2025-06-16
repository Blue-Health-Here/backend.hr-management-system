import { AttendanceStatus, BreakType, EmployeeStatus } from "../../enums";
import { ICompanyResponseBase } from "./response-base";
import { AbsenceReasonType } from '../../enums/attendance.enum';


export interface IAttendanceResponse extends ICompanyResponseBase {
    employeeId: string;
    date: Date;
    checkInTime?: String;
    checkOutTime?: String;
    status: AttendanceStatus;
    workingHours?: number;
    totalBreakTime?: number;
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
    notes?: string;
    location?: string;
    isRemote: boolean;
    vacationId?: string;
    publicHolidayId?: string;
    employee?: any;
    // Dynamic absenceReason object based on type
    absenceReason?: AbsenceReasonType;  // Will be Vacation or PublicHoliday based on type
    breaks?: IBreakResponse[];
}


export interface IBreakResponse {
    attendanceId: string;
    employeeId: string;
    breakType: BreakType;
    startTime: Date;
    endTime?: Date;
    durationMinutes?: number;
    notes?: string;
    location?: string;
    isActive: boolean;
    attendance?: IAttendanceResponse;
    employee?: any;
}