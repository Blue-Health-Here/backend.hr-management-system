import { inject, injectable } from "tsyringe";
import { VacationRepository } from "../dal";
import { Vacation } from "../entities";
import { IVacationRequest, IVacationResponse } from "../models";
import { Service } from "./generics/service";

@injectable()
export class VacationService extends Service<Vacation, IVacationResponse, IVacationRequest> {
    constructor(@inject('VacationRepository') private readonly vacationRepository: VacationRepository) {
        super(vacationRepository, () => new Vacation())
    }

}
