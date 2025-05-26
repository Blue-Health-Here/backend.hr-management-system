import { injectable } from "tsyringe";
import { Company } from "../entities";
import { ICompanyResponse } from "../models";
import { dataSource } from "./db/db-source";
import { GenericRepository } from "./generics/repository";

@injectable()
export class CompanyRepository extends GenericRepository<Company, ICompanyResponse> {
    constructor(){
        super(dataSource.getRepository(Company));
    }


}