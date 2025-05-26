import { IDefaultUserRequest } from "./user";

export interface ICompanyRequest {
    name: string;
    phoneNo?: string;
    email: string;
    address?: string;
    temporaryAddress?: string;
    zipCode?: number;
    country?: string;
    state?: string;
    city?: string;
    defaultUser?: IDefaultUserRequest;
}