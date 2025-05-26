import { inject, injectable } from "tsyringe";
import { PrivilegeService } from "../bl";
import { CompanyRepository, RoleRepository, UserRepository } from "../dal";
import { Actions, Gender, ICompanyRequest, ICompanyResponse, ITokenUser, IUserRequest,  } from "../models";
import { Company, Role, User } from "../entities";
import { randomUUID } from "crypto";
import { EmptyGuid } from "../constants/guid";
import { Service } from "./generics/service";
import { encrypt } from "../utility";

@injectable()
export class CompanyService extends Service<Company, ICompanyResponse, ICompanyRequest> {
    constructor(
        @inject('UserRepository') private readonly userRepository: UserRepository,
        @inject('CompanyRepository') private readonly companyRepository: CompanyRepository,
        @inject('RoleRepository') private readonly roleRepository: RoleRepository,
        @inject('PrivilegeRepository') private readonly privilegeService: PrivilegeService
    ){
        super(companyRepository, () => new Company)
    }

    async addNewCompany(companyRequest: ICompanyRequest, contextUser?: ITokenUser): Promise<ICompanyResponse> {
        try {
            // Start transaction
            // await this.repository.beginTransaction();

            // Create company
            const company = this.createCompanyFromRequest(companyRequest, contextUser);
            await this.companyRepository.invokeDbOperations(company, Actions.Add);
            // Create role
            const role = this.createCompanyAdminRole(company, contextUser);
            await this.roleRepository.invokeDbOperations(role, Actions.Add);

            // Create user
            const user = await this.createUserFromRequest(companyRequest, company, role, contextUser);
            const addedUser = await this.userRepository.invokeDbOperations(user, Actions.Add);
            
            // Prepare response and token
            const companyResponse = company.toResponse();
            const responseUser = addedUser.toResponse();
            responseUser.role = role.toResponse();
            
            // Commit transaction
            // await this.repository.commitTransaction();

            return {
                ...companyResponse,
                user: responseUser
            }

        } catch (error) {
            // Rollback transaction in case of error
            // await this.repository.rollbackTransaction();
            throw error;
        }
    }

    private createCompanyFromRequest(request: ICompanyRequest, contextUser?: ITokenUser): Company {
        const company = new Company().toEntity(
            {
                name: request.name,
                phoneNo: request.phoneNo ?? "",
                email: request.email,
                address: request.address,
                temporaryAddress: request.temporaryAddress,
                zipCode: request.zipCode,
                country: request.country,
                state: request.state,
                city: request.city,
            },
            undefined,
            { 
                name: contextUser?.name ?? "system", 
                id: contextUser?.id ?? EmptyGuid, 
                companyId: contextUser?.companyId ?? "", 
                privileges: contextUser?.privileges ?? [] 
            }
        );
        company.id = randomUUID();
        return company;
    }

    private createCompanyAdminRole(company: Company, contextUser?: ITokenUser): Role {
        const role = new Role().toEntity(
            { name: "Company Admin", code: "companyAdmin", privilegeIds: [] },
            undefined,
            { 
                name: contextUser?.name ?? "system", 
                id: contextUser?.id ?? EmptyGuid, 
                companyId: contextUser?.companyId ?? "", 
                privileges: contextUser?.privileges ?? [] 
            }
        );
        role.id = randomUUID();
        role.privileges = [];
        role.companyId = company.id;
        role.company = company;
        return role;
    }

    private async createUserFromRequest(request: ICompanyRequest, company: Company, role: Role, contextUser?: ITokenUser): Promise<User> {
        let userRequest: IUserRequest = {
            userName: request.defaultUser?.userName ?? "",
            email: request.defaultUser?.email ?? "",
            password: request.defaultUser?.password,
            firstName: request.defaultUser?.firstName ?? "",
            middleName: request.defaultUser?.middleName,
            lastName: request.defaultUser?.lastName ?? "",
            dateOfBirth: request.defaultUser?.dateOfBirth,
            gender: request.defaultUser?.gender ?? Gender.Unknown,
            pictureUrl: request.defaultUser?.pictureUrl ?? "",
            roleId: "",
            isGoogleSignup: false
        };
        const user = new User().toEntity(
            {
                ...userRequest,
                isGoogleSignup: false,
            },
            undefined,
            { 
                name: contextUser?.name ?? "system", 
                id: contextUser?.id ?? EmptyGuid, 
                companyId: contextUser?.companyId ?? "", 
                privileges: contextUser?.privileges ?? [] 
            }
        );

        user.role = role;
        user.company = company;
        user.roleId = role.id;
        user.companyId = company.id;

        if (userRequest.password) {
            user.passwordHash = await encrypt(userRequest.password);
        }

        return user;
    }
}