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

}