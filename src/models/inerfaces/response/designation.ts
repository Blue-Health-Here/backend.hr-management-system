import { DesignationStatus, LevelHierarchy } from "../../enums";
import { ICompanyResponseBase } from "./response-base";
import { IDepartmentResponse } from "./department";

export interface IDesignationResponse extends ICompanyResponseBase {
    departmentId?: number;
    title: string;
    code?: string;
    jobDescription?: string;
    levelHierarchy: LevelHierarchy;
    responsibilities?: string;
    status: DesignationStatus;
    sortOrder?: number;
    department?: IDepartmentResponse;
}