import { inject, injectable } from "tsyringe";
import { ShiftRepository } from "../dal";
import { Shift } from "../entities";
import { IShiftRequest, IShiftResponse } from "../models";
import { Service } from "./generics/service";

@injectable()
export class ShiftService extends Service<Shift, IShiftResponse, IShiftRequest> {
    constructor(@inject('ShiftRepository') private readonly shiftRepository: ShiftRepository) {
        super(shiftRepository, () => new Shift())
    }

}
