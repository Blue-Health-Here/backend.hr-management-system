import { randomUUID } from "crypto";
import { Column, Entity } from "typeorm";
import { EmptyGuid } from "../constants";
import { ICountryResponse, ITokenUser } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { EntityBase } from "./base-entities/entity-base";

@Entity('Country')
export class Country extends EntityBase implements IToResponseBase<Country, ICountryResponse> {

    @Column({ type: 'text', unique: true, nullable: false })
    name!: string;

    @Column({ type: 'varchar', unique: true, nullable: false, length: 3 })
    code!: string;

    @Column({ type: 'varchar', unique: true, nullable: false, length: 2 })
    iso2!: string;

    @Column({ type: 'text', nullable: true })
    capital?: string;

    @Column({ type: 'text', nullable: true })
    continent?: string;

    @Column({ type: 'text', nullable: true })
    currency?: string;

    @Column({ type: 'text', nullable: true })
    phone?: string;

    newInstanceToAdd(name: string, code: string, iso2: string, capital?: string, continent?: string, currency?: string, phone?: string): Country {
        this.id = randomUUID();
        this.createdAt = new Date();
        this.createdBy = "System";
        this.createdById = EmptyGuid;
        this.active = true;
        this.deleted = false;
        this.name = name;
        this.code = code;
        this.iso2 = iso2;
        this.capital = capital;
        this.continent = continent;
        this.currency = currency;
        this.phone = phone;
        return this;
    }

    toEntity(requestEntity: Country, id?: string, contextUser?: ITokenUser): Country {
        return requestEntity;
    }

    toResponse(entity?: Country): ICountryResponse {
        if (!entity) entity = this;

        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            code: entity.code,
            iso2: entity.iso2,
            capital: entity.capital,
            continent: entity.continent,
            currency: entity.currency,
            phone: entity.phone,
        }
    }
}