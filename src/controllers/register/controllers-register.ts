import { DependencyContainer } from 'tsyringe'
import { CompanyController } from '../company-controller'
import { UserController } from '../user-controller';
import { PrivilegeController } from '../privilege-controller';
import { RoleController } from '../role-controller';
import { ToDoController } from '../todo-controller';
import { AuthController } from '../auth-controller';
import { DepartmentController } from '../deparment-controller';

export const registerControllers = (container: DependencyContainer) => {
    container.register<CompanyController>('CompanyController', CompanyController);
    container.register<PrivilegeController>('PrivilegeController', PrivilegeController);
    container.register<ToDoController>('ToDoController', ToDoController);
    container.register<RoleController>('RoleController', RoleController);
    container.register<AuthController>('AuthController', AuthController);
    container.register<DepartmentController>('DepartmentController', DepartmentController);

    return {
        companyController: container.resolve(CompanyController),
        userController: container.resolve(UserController),
        privilegeController: container.resolve(PrivilegeController),
        roleController: container.resolve(RoleController),
        toDoController: container.resolve(ToDoController),
        authController: container.resolve(AuthController),
        departmentController: container.resolve(DepartmentController),
    }

}