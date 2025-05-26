import { inject, injectable } from "tsyringe";
import { RoleRepository } from "../dal";
import { Role } from "../entities";
import { Actions, IRoleRequest, IRoleResponse, ITokenUser } from "../models";
import { Service } from "./generics/service";
import { AppError } from "../utility/app-error";
import { upperFirst, camelCase } from "lodash";
import { PrivilegeService } from "./privilege-service";
@injectable()
export class RoleService extends Service<Role, IRoleResponse, IRoleRequest> {
    constructor(
        @inject('RoleRepository') private readonly roleRepository: RoleRepository,
        @inject('PrivilegeService') private readonly privilegeService: PrivilegeService
    ){
        super(roleRepository, () => new Role);
    }

    async add(request: IRoleRequest, contextUser: ITokenUser): Promise<IRoleResponse> {
        try {
            const { companyId } = contextUser;
            const { name } = request;

            const camelCasedName = upperFirst(camelCase(name));
            request.name = name;
            request.code = camelCasedName;

            await this.ensureRoleUniqueness(companyId, { ...request });

            let Modules: string[] = ["Users", "Roles"];
            request.privilegeIds = await this.privilegeService.getPrivilegeIdsByModules(Modules);


            return super.add(request, contextUser);
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, request: IRoleRequest, contextUser: ITokenUser): Promise<IRoleResponse> {
        try {
            const { companyId } = contextUser;
            const { name } = request;

            const camelCasedName = upperFirst(camelCase(name));
            request.name = name;
            request.code = camelCasedName;

            await this.ensureRoleUniqueness(companyId, { ...request }, id);

            return super.update(id, request, contextUser);
        } catch (error) {
            throw error;
        }
    }

    private async ensureRoleUniqueness(companyId: string, data: { name: string; code: string }, currentRoleId?: string): Promise<void> {
        const { name, code } = data;

        const existing = await this.roleRepository.findByNameOrCodeInCompany(companyId, name, code);

        if (existing) {
            if (currentRoleId && existing.id === currentRoleId) {
                return;
            }

            if (existing.name === name) {
                throw new AppError("Role name already exists for this company.", '409');
            } else {
                throw new AppError("Role code already exists for this company.", '409');
            }
        }
    }
}
