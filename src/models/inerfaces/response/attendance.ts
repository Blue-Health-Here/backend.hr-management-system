import { AttendanceStatus, BreakType, EmployeeStatus } from "../../enums";
import { ICompanyResponseBase } from "./response-base";
import { AbsenceReasonType } from '../../enums/attendance.enum';


export interface IAttendanceResponse extends ICompanyResponseBase {
    employeeId: string;
    date: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
    status: AttendanceStatus;
    workingHours?: number;
    totalBreakTime?: number;
    lateMinutes?: number;
    notes?: string;
    location?: string;
    isRemote: boolean;
    // Polymorphic fields
    absenceReasonId?: string;
    absenceReasonType?: AbsenceReasonType;
    employee?: any;
    // Dynamic absenceReason object based on type
    absenceReason?: any;  // Will be Vacation or PublicHoliday based on type
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