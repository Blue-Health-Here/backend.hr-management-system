import { AttendanceStatus, BreakType, EmployeeStatus } from "../../enums";
import { ICompanyResponseBase } from "./response-base";
import { AbsenceReasonType, PresentStatus } from '../../enums/attendance.enum';
import { User } from '../../../entities/user';
import { IUserResponse } from "./user";


export interface IAttendanceResponse extends ICompanyResponseBase {
    userId: string;
    date: Date;
    checkInTime?: String;
    checkOutTime?: String;
    status: AttendanceStatus;
    presentStatus?: PresentStatus;
    employeeStatus?: EmployeeStatus;
    workingHours?: number;
    totalBreakTime?: number;
    lateMinutes?: number;
    earlyLeaveMinutes?: number;
    notes?: string;
    location?: string;
    isRemote: boolean;
    vacationId?: string;
    publicHolidayId?: string;
    user?: IUserResponse;
    // Dynamic absenceReason object based on type
    absenceReason?: AbsenceReasonType;  // Will be Vacation or PublicHoliday based on type
    breaks?: IBreakResponse[];
}


export interface IBreakResponse {
    attendanceId: string;
    userId: string;
    breakType: BreakType;
    startTime: Date;
    endTime?: Date;
    durationMinutes?: number;
    notes?: string;
    location?: string;
    isActive: boolean;
    attendance?: IAttendanceResponse;
    user?: IUserResponse
}

export interface IAttendanceStatsResponse {
    totalPresent: number;
    totalAbsent: number;
}
