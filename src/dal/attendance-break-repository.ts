import { injectable } from "tsyringe";
import { IBreakRequest } from "../models";
import { dataSource } from "./db/db-source";
import { GenericRepository } from "./generics/repository";
import { AttendanceBreak } from '../entities';

@injectable()
export class AttendanceBreakRepository extends GenericRepository<AttendanceBreak, IBreakRequest> {
    constructor(){
        super(dataSource.getRepository(AttendanceBreak));
    }
}