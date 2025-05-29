import { randomUUID } from "crypto";
import { Column, Entity } from "typeorm";
import { EmptyGuid } from "../constants";
import { ICountryResponse, ICountryRequest, ITokenUser } from "../models";
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

    toEntity(requestEntity: ICountryRequest, id?: string, contextUser?: ITokenUser): Country {
        this.name = requestEntity.name ?? "";
        this.code = requestEntity.code ?? "";
        this.iso2 = requestEntity.iso2 ?? "";
        this.capital = requestEntity.capital ?? "";
        this.continent = requestEntity.continent ?? "";
        this.currency = requestEntity.currency ?? "";
        this.phone = requestEntity.phone ?? "";
        return this;
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