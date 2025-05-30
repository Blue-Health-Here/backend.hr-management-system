import { Column, Entity, JoinColumn, ManyToOne, ManyToMany, JoinTable, Unique, Index } from "typeorm";
import { IPublicHolidayRequest, IPublicHolidayResponse, ITokenUser, PublicHolidayStatus } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { Country } from "./country"; // Assuming you have a Country entity

@Entity('PublicHoliday')
@Unique(['companyId', 'date']) // Ensure unique date per company
@Index(['companyId', 'date']) // Index for better query performance
export class PublicHoliday extends CompanyEntityBase implements IToResponseBase<PublicHoliday, IPublicHolidayResponse> {
    
    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string;

    @Column({ type: 'date', nullable: false }) // Only date, no timestamp
    date!: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    type?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'int', nullable: true })
    whichCountryId?: number;

    @Column({ 
        type: 'enum', 
        enum: PublicHolidayStatus, 
        default: PublicHolidayStatus.ACTIVE 
    })
    status!: PublicHolidayStatus;

    // Relationship with Country - nullable
    @ManyToOne(() => Country, { 
        nullable: true, 
        eager: false,
        onDelete: 'SET NULL'
    })
    @JoinColumn({ name: 'whichCountryId', referencedColumnName: 'id' })
    country?: Country;

    
    toResponse(entity?: PublicHoliday): IPublicHolidayResponse {
        if(!entity) entity = this;

        return {
            ...super.toCompanyResponseBase(entity),
            name: entity.name,
            date: entity.date,
            type: entity.type,
            description: entity.description,
            whichCountryId: entity.whichCountryId,
            status: entity.status,
            country: entity.country ? {
                id: entity.country.id,
                name: entity.country.name,
                code: entity.country.code,
            } : undefined,
        }
    }

    toEntity = (entityRequest: IPublicHolidayRequest, id?: string, contextUser?: ITokenUser): PublicHoliday => {
        this.name = entityRequest.name;
        this.date = new Date(entityRequest.date);
        this.type = entityRequest.type;
        this.description = entityRequest.description;
        this.whichCountryId = entityRequest.whichCountryId;
        
        this.status = entityRequest.status && typeof entityRequest.status === "string"
            ? (PublicHolidayStatus[entityRequest.status.toUpperCase() as keyof typeof PublicHolidayStatus] ?? PublicHolidayStatus.ACTIVE)
            : (entityRequest.status || PublicHolidayStatus.ACTIVE);

        // Set country if whichCountryId is provided
        if (entityRequest.whichCountryId) {
            let country = new Country();
            country.id = entityRequest.whichCountryId.toString();
            this.country = country;
        }

        if(contextUser) super.toCompanyEntity(contextUser, id);
        
        return this;
    }
}