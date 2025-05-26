import { injectable } from "tsyringe";
import { User } from "../entities";
import { IUserResponse } from "../models";
import { dataSource } from "./db/db-source";
import { GenericRepository } from "./generics/repository";

@injectable()
export class UserRepository extends GenericRepository<User,IUserResponse>    {
    constructor(){
        super(dataSource.getRepository(User));
    }

}