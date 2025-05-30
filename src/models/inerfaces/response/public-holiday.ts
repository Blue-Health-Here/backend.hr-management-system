import { PublicHolidayStatus } from "../../enums";
import { ICompanyResponseBase } from "./response-base";
import { IDepartmentResponse } from "./department";
import { ICountryMinimalResponse } from "./country";

export interface IPublicHolidayResponse extends ICompanyResponseBase {
    departmentId?: number;
    name: string;
    date: Date; // Date without time, stored as Date object
    type?: string; // Optional, e.g., "National", "Religious"
    description?: string; // Optional, additional details
    whichCountryId?: number; // Optional, ID of the country this holiday belongs to
    status?: PublicHolidayStatus; // Default is ACTIVE
    country?: ICountryMinimalResponse; // Minimal country response
    departments?: IDepartmentResponse[];
}