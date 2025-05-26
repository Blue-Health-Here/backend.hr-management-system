import { IResponseBase } from "./response-base";
import { IDefaultUserResponse } from "./user";
import { User } from '../../../entities/user';

export interface ICompanyResponse extends IResponseBase {
    name: string;
    phoneNo?: string;
    email: string;
    address?: string;
    temporaryAddress?: string;
    zipCode?: number;
    country?: string;
    state?: string;
    city?: string;
    user?: IDefaultUserResponse;
}