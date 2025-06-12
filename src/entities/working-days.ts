import { Column, Entity, Index, Unique } from "typeorm";
import { ITokenUser, DayName, IWorkingDaysRequest, IWorkingDaysResponse } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { ICompanyResponseBase } from "../models/inerfaces/response/response-base";


@Entity('WorkingDays')
@Unique(['companyId', 'dayOfWeek'])
@Index(['companyId', 'dayOfWeek'], { unique: true })
export class WorkingDays extends CompanyEntityBase implements IToResponseBase<WorkingDays, IWorkingDaysResponse> {

    @Column({ type: 'smallint', nullable: false })
    dayOfWeek!: number; // 1=Monday, 2=Tuesday... 7=Sunday

    @Column({ type: 'enum', enum: DayName, nullable: false })
    dayName!: DayName;

    @Column({ type: 'boolean', default: true })
    isWorkingDay!: boolean;

    @Column({ type: 'text', nullable: true })
    notes?: string;
    
    toResponse(entity?: WorkingDays): IWorkingDaysResponse {
        if(!entity) entity = this;

        return {
            ...super.toCompanyResponseBase(entity),
            dayOfWeek: entity.dayOfWeek,
            dayName: entity.dayName,
            isWorkingDay: entity.isWorkingDay,
            notes: entity.notes
        }
    }

    toEntity = (entityRequest: IWorkingDaysRequest, id?: string, contextUser?: ITokenUser): WorkingDays => {
        // Set dayOfWeek based on dayName
        this.dayOfWeek = WorkingDays.getDayNumber(entityRequest.dayName);
        this.dayName = entityRequest.dayName;
        this.isWorkingDay = entityRequest.isWorkingDay ?? true;
        this.notes = entityRequest.notes;

        if(contextUser) super.toCompanyEntity(contextUser, id);
        
        return this;
    }

    // Helper method to get day number from day name
    static getDayNumber(dayName: DayName): number {
        const days: { [key in DayName]: number } = {
            [DayName.MONDAY]: 1,
            [DayName.TUESDAY]: 2,
            [DayName.WEDNESDAY]: 3,
            [DayName.THURSDAY]: 4,
            [DayName.FRIDAY]: 5,
            [DayName.SATURDAY]: 6,
            [DayName.SUNDAY]: 7
        };
        
        return days[dayName];
    }
}