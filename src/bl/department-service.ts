import { inject, injectable } from "tsyringe";
import { DepartmentRepository } from "../dal";
import { Department } from "../entities";
import { IDepartmentRequest, IDepartmentResponse, ITokenUser } from "../models";
import { Service } from "./generics/service";
import { generateCodeFromName } from "../utility";
import { AppError } from "../utility/app-error";
import { Not } from "typeorm";
@injectable()
export class DepartmentService extends Service<Department, IDepartmentResponse, IDepartmentRequest> {
    constructor(@inject('DepartmentRepository') private readonly departmentRepository: DepartmentRepository) {
        super(departmentRepository, () => new Department());
    }


    async update(id: string, request: IDepartmentRequest, contextUser: ITokenUser): Promise<IDepartmentResponse> {
        const { name } = request;
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
}
