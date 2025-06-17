import { inject, injectable } from "tsyringe";
import { CompanyRepository, RoleRepository, UserRepository, VerificationRepository } from "../dal";
import { Actions, FilterMatchModes, FilterOperators, IForgotPasswordRequest, ILoginRequest, IResendCodeRequest, IResetPasswordRequest, ISignUpRequest, IUserRequest, IUserResponse, IVerifyRequest } from "../models";
import { Company, Role, User, Verification } from "../entities";
import { randomUUID, randomInt } from "crypto";
import { compareHash, encrypt, signJwt  } from "../utility";
import { FastifyError } from 'fastify'
import { Service } from "./generics/service";
import { EmptyGuid } from "../constants";
import { ILike, QueryRunner } from "typeorm";
import { AppError } from '../utility/app-error';
import { PrivilegeService } from "./privilege-service";
import { sendForgotPasswordCode, sendVerificationEmail } from "../utility/mail-utility";
import { VerificationTypes } from "../models";



@injectable()
export class UserService extends Service<User, IUserResponse, IUserRequest> {

    constructor(
        @inject('UserRepository') private readonly userRepository: UserRepository,
        @inject('CompanyRepository') private readonly companyRepository: CompanyRepository,
        @inject('RoleRepository') private readonly roleRepository: RoleRepository,
        @inject('PrivilegeService') private readonly privilegeService: PrivilegeService,
        @inject('VerificationRepository') private readonly verificationRepository: VerificationRepository,
    ) {
        super(userRepository, () => new User)
    }
    
    async login(loginRequest: ILoginRequest): Promise<IUserResponse & { token: string }> {
        let user: User | null = null;
            user = await this.userRepository.firstOrDefault({ 
                where: [{userName: loginRequest.userName}, { email: ILike(loginRequest.userName) }], 
                relations: { company: true, role: true, employee: true }
            });
        if (!user) {
            throw new AppError('Invalid username or password', '401');
        }

        // Check if the user is email verified
        if (!user.isEmailVerified) {
            throw new AppError('Email not verified', '401');
        }   


        const match = await compareHash(loginRequest.password, user.passwordHash ?? '');

        if (!match) { 
            throw new AppError('Invalid username or password', '401');
        }

        await this.userRepository.partialUpdate(user.id, { lastLogin: new Date() });

        return {
            ...user.toResponse(user),
            token: signJwt({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                companyId: user.companyId,
                roleId: user.roleId,
                role: user.role?.code ?? '',
                employeeId: user.employee?.id ?? undefined,
                privileges: user.role?.privileges.map((p) => p.code) ?? []
            })
        };
    }
    
    async loginWithGoogle(email: string, accessToken: string, refreshToken: string): Promise<IUserResponse & {token: string}> {
        let user = await this.userRepository.getOneByQuery({filters:[{field: 'email', value: email, operator: FilterOperators.And, matchMode: FilterMatchModes.Equal, ignoreCase: true}], relations: {company: true, role: true}});
        let error: FastifyError = {code: '401', message: 'Invalid username or password', name: 'Unauthorized'};

        if (!user) throw new Error('Invalid username or password',  error);
        
        await this.userRepository.partialUpdate(user.id, {lastLogin: new Date(), googleAccessToken: accessToken, googleRefreshToken: refreshToken});
        return {...user.toResponse(user), token: signJwt({
            id: user.id, 
            name: `${user.firstName} ${user.lastName}`,  
            companyId: user.companyId,
            roleId: user.roleId,
            role: user.role?.code ?? '',
            employeeId: user.employee?.id ?? undefined,
            privileges: []
        }
        )};
    }

    async signUp(signUpRequest: ISignUpRequest): Promise<IUserResponse & { token: string }> {
        try {
            // // Start transaction
            // await this.repository.beginTransaction();

            // Create company
            const company = this.createCompanyFromRequest(signUpRequest);
            await this.companyRepository.invokeDbOperations(company, Actions.Add);

            // Get Privileges
            const modules: string[] = ["Users", "Roles"];
            const privilegeIds = await this.privilegeService.getPrivilegeIdsByModules(modules);

            // Create role
            let role = this.createCompanyAdminRole(company.id, company, privilegeIds);
            await this.roleRepository.invokeDbOperations(role, Actions.Add);

            // Create user
            const user = await this.createUserFromRequest(signUpRequest, company, role);
            const addedUser = await this.userRepository.invokeDbOperations(user, Actions.Add);

            // Create verification record
            const resultVerification = this.createVerificationRecord(addedUser, VerificationTypes.AccountVerify);
            await this.verificationRepository.invokeDbOperations(resultVerification.verification, Actions.Add);

            // Prepare response and token
            const responseUser = addedUser.toResponse();
            responseUser.company = company.toResponse();
            responseUser.role = role.toResponse();
            
            const token = signJwt({
                id: responseUser.id,
                name: `${responseUser.firstName} ${responseUser.lastName}`,
                companyId: responseUser.companyId ?? "",
                roleId: responseUser.roleId ?? "",
                role: responseUser.role?.code,
                employeeId: user.employee?.id ?? undefined,
                privileges: []
            });
            // // Commit transaction
            // await this.repository.commitTransaction();

            // Send verification email
            sendVerificationEmail(addedUser.email, {
                name: `${addedUser.firstName} ${addedUser.lastName}`,
                code: resultVerification.code,
            });
            
            return { ...responseUser, token };

        } catch (error) {
            // Rollback transaction in case of error
            await this.repository.rollbackTransaction();
            throw error;
        }
    }

    async signUpWithGoogle(signUpRequest: ISignUpRequest, accessToken: string, refreshToken: string): Promise<IUserResponse & {token: string}> {
        const queryRunner = await this.repository.beginTransaction()
        let user = (await this.createNewUserCompany(signUpRequest, true, queryRunner));
        user.googleAccessToken = accessToken;
        user.googleRefreshToken = refreshToken;
        let addedUser: User = new User
        try {
            addedUser = await this.userRepository.invokeDbOperations(user, Actions.Add);
            await this.repository.commitTransaction();
        } catch (error) {
            await this.repository.rollbackTransaction();
            throw error;
        }
        let responseUser = addedUser.toResponse();
        responseUser.company = user.company?.toResponse();
        responseUser.role = user.role?.toResponse();
        return {...responseUser, token: signJwt({
            id: responseUser.id, 
            name: `${responseUser.firstName} ${responseUser.lastName}`, 
            companyId: responseUser.companyId ?? "", 
            roleId: responseUser.roleId ?? "",
            role: responseUser.role?.code ?? '',
            privileges: []})};
    }

    async verify(query: IVerifyRequest): Promise<IUserResponse> {
        const { userId, code, whichPurpose } = query;
        const [user, verification] = await Promise.all([
            this.userRepository.getOneByQuery({
                filters: [{ field: 'id', value: userId, operator: FilterOperators.And, matchMode: FilterMatchModes.Equal }],
                relations: { company: true, role: true }
            }),
            this.verificationRepository.firstOrDefault({ 
                where: { userId, code },
                order: { createdAt: 'DESC' },
             })
        ]);

        if (!user) throw new AppError('User not found', '404');
        if (!verification) throw new AppError('Verification record not found', '404');
        if (verification.whichPurpose !== whichPurpose) throw new AppError('Verification record not found', '404');
        if (verification.verified) throw new AppError('User already verified', '400');
        if (verification.expiresAt < new Date()) throw new AppError('Verification code has expired', '400');
        if (verification.code !== code) throw new AppError('Invalid verification code', '400');

        if (whichPurpose === VerificationTypes.AccountVerify) {
            user.isEmailVerified = true;
            verification.verified = true;

            await Promise.all([
                this.userRepository.invokeDbOperations(user, Actions.Update),
                this.verificationRepository.invokeDbOperations(verification, Actions.Update)
            ]);
        }

        return user.toResponse();

    }

    private createCompanyFromRequest(request: ISignUpRequest): Company {
        const company = new Company().toEntity(
            {
                name: request.userName,
                phoneNo: request.phoneNum ?? "",
                email: request.email,
                address: request.address,
                temporaryAddress: request.temporaryAddress,
                zipCode: request.zipCode,
                country: request.country,
                state: request.state,
                city: request.city,
            },
            undefined,
            { name: "System Signup", id: EmptyGuid, companyId: "", roleId: "", role: "", privileges: [] }
        );
        company.id = randomUUID();
        return company;
    }

    private createCompanyAdminRole(companyId: string, company: Company, privilegeIds: string[]): Role {
        const role = new Role().toEntity(
            { name: "Company Admin", code: "companyAdmin", privilegeIds },
            undefined,
            { name: "System Signup", id: EmptyGuid, companyId: "", roleId: "", role: "", privileges: [] }
        );
        role.id = randomUUID();
        role.companyId = companyId;
        role.company = company;
        return role;
    }

    private async createUserFromRequest(request: ISignUpRequest, company: Company, role: Role): Promise<User> {
        const user = new User().toEntity(
            {
                userName: request.userName,
                email: request.email,
                firstName: request.firstName,
                middleName: request.middleName,
                lastName: request.lastName,
                dateOfBirth: request.dateOfBirth,
                gender: request.gender,
                pictureUrl: request.pictureUrl,
                roleId: role.id,
                isGoogleSignup: false,
            },
            undefined,
            { name: "System Signup", id: EmptyGuid, companyId: EmptyGuid, roleId: "", role: "", privileges: [] }
        );

        user.role = role;
        user.company = company;
        user.roleId = role.id;
        user.companyId = company.id;

        if (request.password) {
            user.passwordHash = await encrypt(request.password);
        }

        return user;
    }

    private  createVerificationRecord(user: User, whichPurpose: string): { verification: Verification, code: string } {
        // Generate random 6-digit code
        const otpCode = randomInt(100000, 999999).toString();
        
        // Create verification entity
        const verification = new Verification().toEntity(
            {
                userId: user.id,
                target: user.email,
                type: "email",
                code: otpCode,
                whichPurpose: whichPurpose,
                isVerified: false,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Set expiration time to 10 minutes from now
            },
            undefined,
            { name: "System Signup", id: EmptyGuid, companyId: "", roleId: "", role: "", privileges: [] }
        );
        verification.id = randomUUID();

        return { verification, code: otpCode };
   
    }

    private async createNewUserCompany(userRequest: ISignUpRequest, isGoogle: boolean = false, queryRunner?: QueryRunner): Promise<User>{
        try{

            let company: Company = new Company().toEntity(
              {
                name: userRequest.userName,
                phoneNo: userRequest.phoneNum ?? "",
                email: userRequest.email,
                address: userRequest.address,
                temporaryAddress: userRequest.temporaryAddress,
                zipCode: userRequest.zipCode,
                country: userRequest.country,
                state: userRequest.state,
                city: userRequest.city,
              },
              undefined,
              { name: "system", id: EmptyGuid, companyId: "", roleId: "", role: "", privileges: [] }
            );
            company.id = randomUUID();
            let role: Role = new Role().toEntity(
              { name: "Company Admin", code: "companyAdmin", privilegeIds: [] },
              undefined,
              { name: "system", id: EmptyGuid, companyId: "", roleId: "", role: "", privileges: [] }
            );
    
            role.id = randomUUID();
            role.privileges = [];
            role.companyId = undefined;
            role.company = undefined;
    
            await this.companyRepository.invokeDbOperations(company, Actions.Add);
            await this.roleRepository.invokeDbOperations(role, Actions.Add);
    
            let user: User = new User().toEntity(
              {
                userName: userRequest.userName,
                email: userRequest.email,
                firstName: userRequest.firstName,
                middleName: userRequest.middleName,
                lastName: userRequest.lastName,
                dateOfBirth: userRequest.dateOfBirth,
                gender: userRequest.gender,
                pictureUrl: userRequest.pictureUrl,
                roleId: role.id,
                isGoogleSignup: false,
              },
              undefined,
              { name: "Admin", id: EmptyGuid, companyId: EmptyGuid, roleId: "", role: "", privileges: [] }
            );
    
            user.role = role;
            user.company = company;
            user.roleId = role.id;
            user.companyId = company.id;
    
            if (userRequest.password)
              user.passwordHash = await encrypt(userRequest.password);
            return user;
        }catch(err){

            await this.repository.rollbackTransaction();
            throw err
        }
    }


    async resendCode(query: IResendCodeRequest): Promise<IUserResponse> {

        const { email, whichPurpose } = query;

        const user = await this.userRepository.getOneByQuery({
            filters: [{ field: 'email', value: email, operator: FilterOperators.And, matchMode: FilterMatchModes.Equal }]
        });

        if (!user) throw new AppError('User not found', '404');

        // Create verification record
        const resultVerification = this.createVerificationRecord(user, whichPurpose);
        await this.verificationRepository.invokeDbOperations(resultVerification.verification, Actions.Add);

        if (whichPurpose === VerificationTypes.AccountVerify) {
            // Send verification email
            sendVerificationEmail(user.email, {
                name: `${user.firstName} ${user.lastName}`,
                code: resultVerification.code,
            });
        } else if (whichPurpose === VerificationTypes.ForgotPassword) {
            // Send forgot password email
            sendForgotPasswordCode(user.email, {
                name: `${user.firstName} ${user.lastName}`,
                code: resultVerification.code,
            });
        }

        return user.toResponse();
    }

    async forgotPassword(query: IForgotPasswordRequest): Promise<IUserResponse> {
        const { email } = query;
        const user = await this.userRepository.getOneByQuery({
            filters: [{ field: 'email', value: email, operator: FilterOperators.And, matchMode: FilterMatchModes.Equal }]
        });

        if (!user) throw new AppError('User not found', '404');

        // Create verification record
        const resultVerification = this.createVerificationRecord(user, VerificationTypes.ForgotPassword);
        await this.verificationRepository.invokeDbOperations(resultVerification.verification, Actions.Add);

        // Send forgot password email
        sendForgotPasswordCode(user.email, {
            name: `${user.firstName} ${user.lastName}`,
            code: resultVerification.code,
        });

        return user.toResponse();
    }

    async resetPassword(query: IResetPasswordRequest): Promise<IUserResponse> {
        const { userId, code, newPassword } = query;

        const user = await this.userRepository.getOneByQuery({
            filters: [{ field: 'id', value: userId, operator: FilterOperators.And, matchMode: FilterMatchModes.Equal }]
        });

        if (!user) throw new AppError('User not found', '404');

        const verification = await this.verificationRepository.firstOrDefault({
            where: { userId: user.id },
            order: { createdAt: 'DESC' },
        });

        if (!verification) throw new AppError('Verification record not found', '404');
        if (verification.verified) throw new AppError('User already verified', '400');
        if (verification.expiresAt < new Date()) throw new AppError('Verification code has expired', '400');
        if (verification.code !== code) throw new AppError('Invalid verification code', '400');

        user.passwordHash = await encrypt(newPassword);
        verification.verified = true;

        await Promise.all([
            this.userRepository.invokeDbOperations(user, Actions.Update),
            this.verificationRepository.invokeDbOperations(verification, Actions.Update)
        ]);

        return user.toResponse();
    }


    async getById(id: string): Promise<IUserResponse> {
        if (!id) throw new AppError('User ID is required', '400');

        const userEntity = await this.userRepository.getOneByQuery({
            filters: [{ field: 'id', value: id, operator: FilterOperators.And, matchMode: FilterMatchModes.Equal }],
            relations: { company: true, role: true, employee: true }
        });

        if (!userEntity) throw new AppError('User not found', '404');

        return userEntity.toResponse();
    }
}