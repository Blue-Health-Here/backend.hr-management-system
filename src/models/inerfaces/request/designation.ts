import { DesignationStatus, LevelHierarchy } from "../../enums";

export interface IDesignationRequest {
    title: string;
    departmentId?: string;
    code?: string;
    jobDescription?: string;
    levelHierarchy?: LevelHierarchy;
    responsibilities?: string;
    status?: DesignationStatus;
    sortOrder?: number;
}