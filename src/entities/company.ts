import { Column, Entity, Unique } from "typeorm";
import { ICompanyRequest, ICompanyResponse } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { IToResponseBase } from "./abstractions/to-response-base";
import { EntityBase } from "./base-entities/entity-base";

@Entity('Company')
export class Company extends EntityBase implements IToResponseBase<Company, ICompanyResponse> {

    @Column({ type: 'text', unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    phoneNo?: string;

    @Column({ type: 'text', unique: true })
    email!: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'text', nullable: true })
    temporaryAddress?: string;

    @Column({ type: 'int', nullable: true })
    zipCode?: number;

    @Column({ type: 'text', nullable: true })
    country?: string;

    @Column({ type: 'text', nullable: true })
    state?: string;

    @Column({ type: 'text', nullable: true })
    city?: string;

    toResponse(entity?: Company): ICompanyResponse {

        if(!entity) entity = this;

        return {
            ...super.toResponseBase(entity),
            name: entity.name,
            phoneNo: entity.phoneNo,
            email: entity.email,
            address: entity.address,
            temporaryAddress: entity.temporaryAddress,
            zipCode: entity.zipCode,
            country: entity.country,
            state: entity.state,
            city: entity.city,
        }
    }

    toEntity = (requestEntity: ICompanyRequest, id?: string, contextUser?: ITokenUser): Company => {
        this.name = requestEntity.name;
        this.phoneNo = requestEntity.phoneNo;
        this.email = requestEntity.email;
        this.address = requestEntity.address;
        this.temporaryAddress = requestEntity.temporaryAddress;
        this.zipCode = requestEntity.zipCode;
        this.country = requestEntity.country;
        this.state = requestEntity.state;
        this.city = requestEntity.city;

        if(contextUser) super.toBaseEntiy(contextUser, id)

        return this;
    }
}