import { inject, injectable } from "tsyringe";
import { DepartmentRepository, DesignationRepository } from "../dal";
import { Department } from "../entities";
import { IDepartmentRequest, IDepartmentResponse, ITokenUser } from "../models";
import { Service } from "./generics/service";
import { generateCodeFromName, sanitizeString } from "../utility";
import { AppError } from "../utility/app-error";
import { Not } from "typeorm";
@injectable()
export class DepartmentService extends Service<Department, IDepartmentResponse, IDepartmentRequest> {
    constructor(
        @inject('DepartmentRepository') private readonly departmentRepository: DepartmentRepository,
        @inject('DesignationRepository') private readonly designationRepository: DesignationRepository
    ) {
        super(departmentRepository, () => new Department());
    }


    async update(id: string, request: IDepartmentRequest, contextUser: ITokenUser): Promise<IDepartmentResponse> {
        let { name } = request;
        name = sanitizeString(name);
        const camelCasedName = generateCodeFromName(name);

        const existing = await this.departmentRepository.firstOrDefault({
            where: [
                { name: name, id: Not(id) },
                { code: camelCasedName, id: Not(id) }
            ]
        });

        if (existing) {
            throw new AppError(`Department with name ${name} already exists`, '409');
        }

        request.code = camelCasedName;

        return super.update(id, request, contextUser);
    }

    async getDepartmentWithDesignations(id: string, contextUser?: ITokenUser): Promise<IDepartmentResponse | null> {
        

        const department = await this.departmentRepository.firstOrDefault({
            where: { id },
            relations: ['designations']
        });

        if (!department) {
            return null;
        }

        return department.toResponse();

    }

    // Private method to validate department belongs to same tenant
    public async validateDepartmentTenant(departmentId: number, contextUser: ITokenUser): Promise<void> {
        const department = await this.departmentRepository.firstOrDefault({
            where: { id: departmentId.toString() }
        });

        if (!department) {
            throw new AppError('Department not found', '404');
        }

        // Check if department belongs to same company/tenant
        if (department.companyId !== contextUser.companyId) {
            throw new AppError('You cannot assign designation to a department from different organization', '403');
        }
    }

}
