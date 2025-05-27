import { inject, injectable } from "tsyringe";
import { DepartmentRepository } from "../dal";
import { Department } from "../entities";
import { IDepartmentRequest, IDepartmentResponse } from "../models";
import { Service } from "./generics/service";

@injectable()
export class DepartmentService extends Service<Department, IDepartmentResponse, IDepartmentRequest> {
    constructor(@inject('DepartmentRepository') private readonly departmentRepository: DepartmentRepository) {
        super(departmentRepository, () => new Department());
    }
}
