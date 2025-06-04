import { inject, injectable } from "tsyringe";
import { UserShiftRepository } from "../dal";
import { UserShift } from "../entities";
import { IUserShiftRequest, IUserShiftResponse } from "../models";
import { Service } from "./generics/service";

@injectable()
export class UserShiftService extends Service<UserShift, IUserShiftResponse, IUserShiftRequest> {
    constructor(@inject('UserShiftRepository') private readonly userShiftRepository: UserShiftRepository) {
        super(userShiftRepository, () => new UserShift())
    }

}
