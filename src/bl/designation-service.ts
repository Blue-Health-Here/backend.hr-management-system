import { inject, injectable } from "tsyringe";
import { DesignationRepository } from "../dal";
import { Designation } from "../entities";
import { IDesignationRequest, IDesignationResponse, ITokenUser } from "../models";
import { Service } from "./generics/service";
import { generateCodeFromName, sanitizeString } from "../utility";
import { AppError } from "../utility/app-error";
import { Not } from "typeorm";
import { DepartmentService } from './department-service';

@injectable()
export class DesignationService extends Service<Designation, IDesignationResponse, IDesignationRequest> {
    constructor(
        @inject('DesignationRepository') private readonly designationRepository: DesignationRepository,
        @inject('DepartmentService') private readonly departmentService: DepartmentService
    ) {
        super(designationRepository, () => new Designation())
    }

    async add(request: IDesignationRequest, contextUser: ITokenUser): Promise<IDesignationResponse> {

        if (request.departmentId) {
            await this.departmentService.validateDepartmentTenant(request?.departmentId, contextUser);
        }

        return super.add(request, contextUser);
    }

    async update(id: string, request: IDesignationRequest, contextUser: ITokenUser): Promise<IDesignationResponse> {
        let { title } = request;
        title = sanitizeString(title);
        const camelCasedName = generateCodeFromName(title);

        const existing = await this.designationRepository.firstOrDefault({
            where: [
                { title: title, id: Not(id) },
                { code: camelCasedName, id: Not(id) }
            ]
        });

        if (existing) {
            throw new AppError(`Designation with title ${title} already exists`, '409');
        }

        request.code = camelCasedName;

        return super.update(id, request, contextUser);
    }

}
