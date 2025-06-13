import { EmployeeStatus } from "../../enums";
import { IDefaultUserRequest } from "./user";

// Employee Request Interface
export interface IEmployeeRequest {
    userId: string;
    employeeCode: string;
    departmentId: string;
    designationId: string;
    joiningDate: Date;
    salary?: number;
    status?: EmployeeStatus;
    address?: string;
    phoneNumber?: string;
    emergencyContact?: string;
    probationEndDate?: Date;
    user: IDefaultUserRequest
    
}