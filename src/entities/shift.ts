import { BeforeInsert, Column, Entity, Index, Unique } from "typeorm";
import { ITokenUser, ShiftType, IShiftRequest,IShiftResponse } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { generateCodeFromName, sanitizeString } from "../utility";



@Entity('Shift')
@Unique(['companyId', 'code'])
@Unique(['companyId', 'name'])
@Index(['companyId', 'code'], { unique: true }) // Unique code per company
@Index(['companyId', 'order']) // Index for ordering shifts
export class Shift extends CompanyEntityBase implements IToResponseBase<Shift, IShiftResponse> {
    
    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string;

    @Column({ type: 'varchar', length: 50, nullable: false })
    code!: string;

    @Column({ type: 'varchar', length: 20, nullable: false })
    shiftType!: ShiftType;

    @Column({ type: 'time', nullable: false })
    startTime!: string;

    @Column({ type: 'time', nullable: false })
    endTime!: string;

    @Column({ type: 'int', nullable: false })
    workingHours!: number; // Working hours in minutes

    @Column({ type: 'int', default: 0 })
    breakDuration!: number; // Break duration in minutes

    @Column({ type: 'int', default: 0 })
    order!: number; // Order/sequence of shift


    @BeforeInsert()
    beforeInsert() {
        // Generate code if not provided
        if (!this.code && this.name) {
            this.name = sanitizeString(this.name);
            this.code = generateCodeFromName(this.name);
        }
    }
    
    toResponse(entity?: Shift): IShiftResponse {
        if(!entity) entity = this;

        return {
            ...super.toCompanyResponseBase(entity),
            name: entity.name,
            code: entity.code,
            shiftType: entity.shiftType,
            startTime: entity.startTime,
            endTime: entity.endTime,
            workingHours: entity.workingHours,
            breakDuration: entity.breakDuration,
            order: entity.order
        }
    }

    toEntity = (entityRequest: IShiftRequest, id?: string, contextUser?: ITokenUser): Shift => {
        this.name = entityRequest.name;
        this.code = entityRequest.code;
        this.shiftType = entityRequest.shiftType;
        this.startTime = entityRequest.startTime;
        this.endTime = entityRequest.endTime;
        this.breakDuration = entityRequest.breakDuration ?? 0;
        this.order = entityRequest.order ?? 0;
        
        // Calculate working hours automatically
        this.workingHours = this.calculateWorkingHours(entityRequest.startTime, entityRequest.endTime);

        if(contextUser) super.toCompanyEntity(contextUser, id);
        
        return this;
    }

    // Helper method to calculate working hours in minutes
    private calculateWorkingHours(startTime: string, endTime: string): number {
        if (!startTime || !endTime) return 0;
        
        try {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            
            if (end <= start) {
                // Handle next day scenario (night shift)
                const nextDayEnd = new Date(`2000-01-02T${endTime}`);
                return Math.round((nextDayEnd.getTime() - start.getTime()) / (1000 * 60));
            }
            
            return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        } catch (error) {
            return 0;
        }
    }

    // Helper method to get net working hours (excluding break)
    getNetWorkingHours(): number {
        return Math.max(0, this.workingHours - this.breakDuration);
    }

    // Helper method to validate shift times
    static isValidTimeFormat(time: string): boolean {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(time);
    }
}