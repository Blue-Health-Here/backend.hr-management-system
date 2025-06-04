import { injectable } from "tsyringe";
import { IShiftResponse } from "../models";
import { dataSource } from "./db/db-source";
import { GenericRepository } from "./generics/repository";
import { Shift  } from '../entities';

@injectable()
export class ShiftRepository extends GenericRepository<Shift, IShiftResponse> {
    constructor(){
        super(dataSource.getRepository(Shift));
    }
}