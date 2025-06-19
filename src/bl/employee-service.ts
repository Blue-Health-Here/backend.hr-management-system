import { inject, injectable } from "tsyringe";
import { EmployeeRepository, RoleRepository, UserRepository } from "../dal";
import { Employee, Role, User } from "../entities";
import { Actions, IEmployeeRequest, IEmployeeResponse, IEmployeeStatsResponse, ITokenUser } from "../models";
import { Service } from "./generics/service";
import { encrypt } from "../utility";
import { Not } from "typeorm";
import { AppError } from "../utility/app-error";

@injectable()
export class EmployeeService extends Service<Employee, IEmployeeResponse, IEmployeeRequest> {
    constructor(
        @inject('EmployeeRepository') private readonly employeeRepository: EmployeeRepository,
        @inject('UserRepository') private readonly userRepository: UserRepository,
        @inject('RoleRepository') private readonly roleRepository: RoleRepository
    ) {
        super(employeeRepository, () => new Employee())
    }


    public async add(entityRequest: IEmployeeRequest, contextUser: ITokenUser): Promise<IEmployeeResponse> {

        let { user: userRequest, ...employeeRequest } = entityRequest;

        //check if employee role exists get other wise create it
        let employeeRole = await this.roleRepository.firstOrDefault({
            where: { code: 'employee' }
        });
        if (!employeeRole) {

            const role = new Role().toEntity(
                { name: "Employee", code: "employee", privilegeIds: [] },
                undefined,
                contextUser
            );

            employeeRole = await this.roleRepository.invokeDbOperations(role, Actions.Add);
        }

        // Create user entity from request
        let user = new User().toEntity(
            {
                ...userRequest,
                roleId: employeeRole.id,
                isEmailVerified: true
            },
            undefined,
            contextUser
        );

        if (!userRequest.password) {
            throw new AppError("Password is required for creating a user.", "400");
        }
        user.passwordHash = await encrypt(userRequest.password);

        await this.userRepository.invokeDbOperations(user, Actions.Add);

        // Create employee entity from request
        let employee = new Employee().toEntity(
            {
                ...employeeRequest,
                userId: user.id,
                user: user,
            },
            undefined,
            contextUser
        );

        if (employeeRequest.status) {
            employee.onStatusChange(employeeRequest.status);
        }

        let employeeCreated = await this.employeeRepository.invokeDbOperations(employee, Actions.Add);

        return employeeCreated.toResponse();
    }

    public async update(id: string, entityRequest: IEmployeeRequest, contextUser: ITokenUser): Promise<IEmployeeResponse> {
        let { user: userRequest, ...employeeRequest } = entityRequest;

        // First, get the existing employee with user data
        const existingEmployee = await this.employeeRepository.firstOrDefault({
            where: { id },
        });

        if (!existingEmployee) {
            throw new Error("Employee not found.");
        }

        // Validation checks before updating
        await this.validateUpdateConstraints(id, userRequest, employeeRequest);

        // Update user data if provided
        if (userRequest && Object.keys(userRequest).length > 0) {
            const existingUser = existingEmployee.user || await this.userRepository.firstOrDefault({
                where: { id: existingEmployee.userId }
            });

            if (!existingUser) {
                throw new Error("Associated user not found.");
            }

            // Create partial user update object
            let userUpdateData: Partial<IEmployeeRequest['user'] & { passwordHash: string }> = {
                ...userRequest
            };

            // Handle password update separately if provided
            if (userRequest.password) {
                userUpdateData.passwordHash = await encrypt(userRequest.password);
                delete userUpdateData.password; // Remove plain password from update data
            }

            // Use partial update for user
            await this.userRepository.partialUpdate(existingUser.id, userUpdateData as any, contextUser);
        }

        // Prepare employee update data
        let finalEmployeeUpdateData = { ...employeeRequest } as Partial<Employee>;

        // Handle status change logic
        if (employeeRequest.status) {
            // Call the status change method to update the entity state
            existingEmployee.onStatusChange(employeeRequest.status);
            
            // Include the updated active field in the update data
            finalEmployeeUpdateData.active = existingEmployee.active;
            
            console.log(`Employee status changed to ${employeeRequest.status}, active set to ${existingEmployee.active}`);
        }

        // Update employee entity if there are employee-specific fields to update
        if (Object.keys(finalEmployeeUpdateData).length > 0) {
            await super.update(existingEmployee.id, finalEmployeeUpdateData as any, contextUser);
        }

        // Return the refreshed employee data
        const refreshedEmployee = await this.employeeRepository.firstOrDefault({
            where: { id },
        });

        return refreshedEmployee!.toResponse();
    }

    // Helper method to validate unique constraints before update
    private async validateUpdateConstraints(
        userId: string, 
        userRequest?: IEmployeeRequest['user'], 
        employeeRequest?: Partial<IEmployeeRequest>
    ): Promise<void> {
        
        // Get current employee to exclude from uniqueness checks
        const currentEmployee = await this.employeeRepository.firstOrDefault({
            where: { id: userId }
        });

        if (!currentEmployee) {
            throw new AppError("Employee not found.", "404");
        }

        // Validate user fields (username, email) if provided
        if (userRequest) {
            // Check username uniqueness
            if (userRequest.userName) {
                const existingUserWithUsername = await this.userRepository.firstOrDefault({
                    where: { 
                        userName: userRequest.userName,
                        id: Not(currentEmployee.userId)
                    }
                });

                if (existingUserWithUsername) {
                    throw new AppError("Username already exists.", "409");
                }
            }

            // Check email uniqueness
            if (userRequest.email) {
                const existingUserWithEmail = await this.userRepository.firstOrDefault({
                    where: { 
                        email: userRequest.email,
                        id: Not(currentEmployee.userId)
                    }
                });

                if (existingUserWithEmail) {
                    throw new AppError("Email already exists.", "409");
                }
            }
        }

        // Validate employee fields (company code, etc.) if provided
        if (employeeRequest) {
            // Check company code uniqueness (assuming you have companyCode field)
            if (employeeRequest.employeeCode) {
                const existingEmployeeWithCode = await this.employeeRepository.firstOrDefault({
                    where: { 
                        employeeCode: employeeRequest.employeeCode,
                        id: Not(userId) // Exclude current employee
                    }
                });

                if (existingEmployeeWithCode) {
                    throw new AppError("Employee code already exists.", "409");
                }
            }
        }
    }

    public async getStats(contextUser: ITokenUser): Promise<IEmployeeStatsResponse> {

        let employees = await super.get(contextUser);
        let totalEmployees = employees.data.length;
        let activeEmployees = employees.data.filter(emp => emp.active === true).length;
        let inactiveEmployees = employees.data.filter(emp => emp.active === false).length;
        // last 30 days new joinings
        let newJoinings = employees.data.filter(emp =>
            emp.joiningDate &&
            new Date(emp.joiningDate) >= new Date(new Date().setDate(new Date().getDate() - 30))
        ).length;

        return {
            totalEmployees,
            activeEmployees,
            inactiveEmployees,
            newJoinings
        };
    }


}
