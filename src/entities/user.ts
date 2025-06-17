import { Column, Entity, JoinColumn, ManyToOne, OneToOne, Unique } from "typeorm";
import { Gender, IUserRequest, IUserResponse, UserStatus } from "../models";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Role } from "./role";
import { text } from "stream/consumers";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { Employee } from "./employee";
@Entity('User')
@Unique(['companyId', 'userName'])
export class User extends CompanyEntityBase implements IToResponseBase<User, IUserResponse> {

    @Column({ type: 'text' })
    userName!: string;

    @Column({ type: 'text', unique: true, nullable: false })
    email!: string;

    @Column({ type: 'text', nullable: true})
    passwordHash?: string;

    @Column({ type: 'text' })
    firstName!: string;

    @Column({ type: 'text', nullable: true })
    middleName?: string;

    @Column({ type: 'text' })
    lastName!: string;

    @Column({type: 'text', default: Gender.Others, nullable: false})
    gender!: Gender;

    @Column({ type: 'text', nullable: true })
    pictureUrl?: string;

    @Column({ type: 'timestamp', nullable: true })
    dateOfBirth?: Date;

    @Column({ type: 'int', default: UserStatus.Offline })
    status!: UserStatus;

    @Column({ type: 'timestamp', nullable: true})
    lastLogin?: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastOnline?: Date;

    @Column({type: "uuid"})
    roleId!: string;

    @Column({type: "text", nullable: true})
    isEmailVerified?: boolean;

    @Column({type: "text", nullable: true})
    isPhoneVerified?: boolean;

    @Column({type: "boolean", default: false})
    isGoogleSignup!: boolean;

    @Column({type: "text", nullable: true})
    googleAccessToken?: string;

    @Column({type: "text", nullable: true})
    googleRefreshToken?: string;

    @ManyToOne(() => Role, (role) => role, {cascade: true, nullable: false})
    @JoinColumn({ name: 'roleId', referencedColumnName: 'id' })
    role!: Role

    @OneToOne(() => Employee, employee => employee.user, { eager: false, nullable: true })
    employee?: Employee;

    toResponse(entity?: User): IUserResponse {

        if(!entity) entity = this;

        return {
            ...super.toCompanyResponseBase(entity),
            userName: entity.userName,
            email: entity.email,
            firstName: entity.firstName,
            middleName: entity.middleName,
            lastName: entity.lastName,
            pictureUrl: entity.pictureUrl,
            dateOfBirth: entity.dateOfBirth,
            gender: entity.gender,
            status: entity.status,
            lastLogin: entity.lastLogin,
            lastOnline: entity.lastOnline,
            roleId: entity.roleId,
            isGoogleSignup: entity.isGoogleSignup,
            isEmailVerified: entity.isEmailVerified,
            isPhoneVerified: entity.isPhoneVerified,
            role: entity.role ? entity.role.toResponse() : undefined,
            employee: entity.employee ? entity.employee.toResponse() : undefined
        }    
    }

    
    toEntity = (requestEntity: IUserRequest, id?: string, contextUser?: ITokenUser): User => {
        this.userName = requestEntity.userName;
        this.email = requestEntity.email;
        this.firstName = requestEntity.firstName;
        this.middleName = requestEntity.middleName;
        this.lastName = requestEntity.lastName;
        this.dateOfBirth = requestEntity.dateOfBirth;
        this.roleId = requestEntity.roleId;
        this.pictureUrl = requestEntity.pictureUrl;
        this.gender = requestEntity.gender;
        this.isGoogleSignup = requestEntity.isGoogleSignup;
        this.googleAccessToken = requestEntity.googleAccessToken;
        this.googleRefreshToken = requestEntity.googleRefreshToken;
        this.isEmailVerified = requestEntity.isEmailVerified;
        this.isPhoneVerified = requestEntity.isPhoneVerified;

        if(contextUser) super.toCompanyEntity(contextUser, id);            

        return this;
    }



}