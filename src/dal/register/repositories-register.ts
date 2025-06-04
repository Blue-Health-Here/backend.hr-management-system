import { DependencyContainer } from "tsyringe";
import { CompanyRepository } from "../company-repository";
import { PrivilegeRepository } from "../privilege-repository";
import { RoleRepository } from "../role-repository";
import { UserRepository } from "../user-repository";
import { ToDoRepository } from "../todo-repository";
import { VerificationRepository } from "../verification-repository";
import { DepartmentRepository } from "../department-repository";
import { DesignationRepository } from "../designation-repository";
import { CountryRepository } from "../country-repository";
import { LeaveTypeRepository } from "../leave-type-repository";
import { PublicHolidayRepository } from "../public-holiday-repository";
import { EmployeeRepository } from "../employee-repository";
import { AttendanceRepository } from "../attendance-repository";
import { AttendanceBreakRepository } from "../attendance-break-repository";
import { VacationRepository } from "../vacation-repository";
import { WorkingDaysRepository } from "../working-days-repository";
import { ShiftRepository } from "../shift-repository";
import { UserShiftRepository } from "../user-shift-repository";
import { SchedulerRepository } from "../scheduler-repository";


export const registerRepositories = (container: DependencyContainer) => {
    container.register<CompanyRepository>('CompanyRepository', CompanyRepository);
    container.register<CountryRepository>('CountryRepository', CountryRepository);
    container.register<UserRepository>('UserRepository', UserRepository);
    container.register<PrivilegeRepository>('PrivilegeRepository', PrivilegeRepository);
    container.register<RoleRepository>('RoleRepository', RoleRepository );
    container.register<ToDoRepository>('ToDoRepository', ToDoRepository );
    container.register<VerificationRepository>('VerificationRepository', VerificationRepository );
    container.register<DepartmentRepository>('DepartmentRepository', DepartmentRepository);
    container.register<DesignationRepository>('DesignationRepository', DesignationRepository);
    container.register<LeaveTypeRepository>('LeaveTypeRepository', LeaveTypeRepository);
    container.register<PublicHolidayRepository>('PublicHolidayRepository', PublicHolidayRepository);
    container.register<EmployeeRepository>('EmployeeRepository', EmployeeRepository);
    container.register<AttendanceRepository>('AttendanceRepository', AttendanceRepository);
    container.register<AttendanceBreakRepository>('AttendanceBreakRepository', AttendanceBreakRepository);
    container.register<VacationRepository>('VacationRepository', VacationRepository);
    container.register<WorkingDaysRepository>('WorkingDaysRepository', WorkingDaysRepository);
    container.register<ShiftRepository>('ShiftRepository', ShiftRepository);
    container.register<UserShiftRepository>('UserShiftRepository', UserShiftRepository);
    container.register<SchedulerRepository>('SchedulerRepository', SchedulerRepository);
}