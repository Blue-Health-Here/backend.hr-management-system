import { DependencyContainer } from "tsyringe";
import { CompanyService } from "../company-service";
import { PrivilegeService } from "../privilege-service";
import { RoleService } from "../role-service";
import { UserService } from "../user-service";
import { ToDoService } from "../todo-service";
import { DepartmentService } from "../department-service";

export const registerServices = (container: DependencyContainer) => {
    container.register<CompanyService>('CompanyService', CompanyService);
    container.register<UserService>('UserService', UserService);
    container.register<PrivilegeService>('PrivilegeService', PrivilegeService);
    container.register<RoleService>('RoleService', RoleService);
    container.register<ToDoService>('ToDoService', ToDoService);
    container.register<DepartmentService>('DepartmentService', DepartmentService);
}