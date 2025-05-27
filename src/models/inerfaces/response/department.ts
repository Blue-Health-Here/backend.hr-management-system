import { ICompanyResponseBase } from "./response-base";
import { IUserResponse } from "./user";

export interface IDepartmentResponse extends ICompanyResponseBase {
    name: string;
    code?: string;
    description?: string;
    parentId?: number;
    status: 'active' | 'inactive';
    sortOrder?: number;
    parent?: IDepartmentResponse;
    children: IDepartmentResponse[];
}