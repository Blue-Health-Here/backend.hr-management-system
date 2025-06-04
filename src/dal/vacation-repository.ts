import { injectable } from "tsyringe";
import { IVacationRequest } from "../models";
import { dataSource } from "./db/db-source";
import { GenericRepository } from "./generics/repository";
import { Vacation } from '../entities';

@injectable()
export class VacationRepository extends GenericRepository<Vacation, IVacationRequest> {
    constructor(){
        super(dataSource.getRepository(Vacation));
    }
}