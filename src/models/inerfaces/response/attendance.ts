import { AttendanceStatus, BreakType, EmployeeStatus, VacationableType } from "../../enums";
import { ICompanyResponseBase } from "./response-base";


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
    vacationableId?: string;
    vacationableType?: VacationableType;
    employee?: any;
    // Dynamic vacationable object based on type
    vacationable?: any;  // Will be LeaveApplication or PublicHoliday based on type
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