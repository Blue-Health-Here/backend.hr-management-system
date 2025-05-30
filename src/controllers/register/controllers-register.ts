import { DependencyContainer } from 'tsyringe'
import { CompanyController } from '../company-controller'
import { UserController } from '../user-controller';
import { PrivilegeController } from '../privilege-controller';
import { RoleController } from '../role-controller';
import { ToDoController } from '../todo-controller';
import { AuthController } from '../auth-controller';
import { DepartmentController } from '../deparment-controller';
import { DesignationController } from '../designation-controller';
import { Country } from '../../entities';
import { CountryController } from '../country-controller';
import { LeaveTypeController } from '../leave-type-controller';
import { PublicHolidayController } from '../public-holiday-controller';

export const registerControllers = (container: DependencyContainer) => {
    container.register<CompanyController>('CompanyController', CompanyController);
    container.register<CountryController>('CountryController', CountryController);
    container.register<PrivilegeController>('PrivilegeController', PrivilegeController);
    container.register<ToDoController>('ToDoController', ToDoController);
    container.register<RoleController>('RoleController', RoleController);
    container.register<AuthController>('AuthController', AuthController);
    container.register<DepartmentController>('DepartmentController', DepartmentController);
    container.register<DesignationController>('DesignationController', DesignationController);
    container.register<LeaveTypeController>('LeaveTypeController', LeaveTypeController);
    container.register<PublicHolidayController>('PublicHolidayController', PublicHolidayController);

    return {
        companyController: container.resolve(CompanyController),
        countryController: container.resolve(CountryController),
        userController: container.resolve(UserController),
        privilegeController: container.resolve(PrivilegeController),
        roleController: container.resolve(RoleController),
        toDoController: container.resolve(ToDoController),
        authController: container.resolve(AuthController),
        departmentController: container.resolve(DepartmentController),
        designationController: container.resolve(DesignationController),
        leaveTypeController: container.resolve(LeaveTypeController),
        publicHolidayController: container.resolve(PublicHolidayController)
    }

}