import { DependencyContainer } from "tsyringe";
import { CompanyService } from "../company-service";
import { PrivilegeService } from "../privilege-service";
import { RoleService } from "../role-service";
import { UserService } from "../user-service";
import { ToDoService } from "../todo-service";
import { DepartmentService } from "../department-service";
import { DesignationService } from "../designation-service";
import { CountryService } from "../country-service";
import { LeaveTypeService } from "../leave-type-service";
import { PublicHolidayService } from "../public-holiday-service";
import { EmployeeService } from "../employee-service";
import { AttendanceService } from "../attendance-service";
import { AttendanceBreakService } from "../attendance-break-service";
import { VacationService } from "../vacation-service";
import { WorkingDaysService } from "../working-days-service";
import { ShiftService } from "../shift-service";
import { UserShiftService } from "../user-shift-service";
import { SchedulerService } from "../scheduler-service";

export const registerServices = (container: DependencyContainer) => {
    container.register<CompanyService>('CompanyService', CompanyService);
    container.register<CountryService>('CountryService', CountryService);
    container.register<UserService>('UserService', UserService);
    container.register<PrivilegeService>('PrivilegeService', PrivilegeService);
    container.register<RoleService>('RoleService', RoleService);
    container.register<ToDoService>('ToDoService', ToDoService);
    container.register<DepartmentService>('DepartmentService', DepartmentService);
    container.register<DesignationService>('DesignationService', DesignationService);
    container.register<LeaveTypeService>('LeaveTypeService', LeaveTypeService);
    container.register<PublicHolidayService>('PublicHolidayService', PublicHolidayService);
    container.register<EmployeeService>('EmployeeService', EmployeeService);
    container.register<AttendanceService>('AttendanceService', AttendanceService);
    container.register<AttendanceBreakService>('AttendanceBreakService', AttendanceBreakService);
    container.register<VacationService>('VacationService', VacationService);
    container.register<WorkingDaysService>('WorkingDaysService', WorkingDaysService);
    container.register<ShiftService>('ShiftService', ShiftService);
    container.register<UserShiftService>('UserShiftService', UserShiftService);
    container.register<SchedulerService>('SchedulerService', SchedulerService);
    
}