import { EmployeeStatus } from "../../enums";

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
}