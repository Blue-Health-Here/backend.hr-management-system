import { DayName } from "../../enums";
import { ICompanyResponseBase } from "./response-base";

export interface IWorkingDaysResponse extends ICompanyResponseBase {
    dayOfWeek: number;
    dayName: DayName;
    isWorkingDay: boolean;
    notes?: string;
}
