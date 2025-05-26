import { injectable } from "tsyringe";
import { Role } from "../entities";
import { IRoleResponse } from "../models";
import { dataSource } from "./db/db-source";
import { GenericRepository } from "./generics/repository";

@injectable()
export class RoleRepository extends GenericRepository<Role, IRoleResponse> {

    constructor(){
        super(dataSource.getRepository(Role));
    }

    async findByNameOrCodeInCompany(companyId: string, name: string, code: string): Promise<Role | null> {
        return this.repository
            .createQueryBuilder("role")
            .where("role.companyId = :companyId", { companyId })
            .andWhere("(role.name = :name OR role.code = :code)", { name, code })
            .getOne();
    }

}