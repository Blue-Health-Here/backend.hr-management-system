import { DesignationStatus, LevelHierarchy } from "../../enums";

export interface IPublicHolidayRequest {
    name: string;
    date: string; // ISO date string
    type?: string; // Optional, e.g., "National", "Religious"
    description?: string; // Optional, additional details
    whichCountryId?: number; // Optional, ID of the country this holiday belongs to
    status?: DesignationStatus; // Optional, default is ACTIVE
}