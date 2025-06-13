import { EmployeeStatus } from "../../enums";
import { IUserResponse } from "./user";
import { ICompanyResponseBase } from "./response-base";
import { IDepartmentResponse } from "./department";
import { IDesignationResponse } from "./designation";

// Employee Response Interface
export interface IEmployeeResponse extends ICompanyResponseBase {
    userId: string;
    employeeCode: string;
    departmentId: string;
    designationId: string;
    joiningDate: Date;
    salary?: number;
    status: EmployeeStatus;
    address?: string;
    phoneNumber?: string;
    emergencyContact?: string;
    probationEndDate?: Date;
    user?: IUserResponse; 
    department?: IDepartmentResponse; 
    designation?: IDesignationResponse; 
}


export interface IEmployeeStatsResponse {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    newJoinings: number;
}