import { inject, injectable } from "tsyringe";
import { PublicHolidayRepository } from "../dal";
import { PublicHoliday } from "../entities";
import { IPublicHolidayRequest, IPublicHolidayResponse } from "../models";
import { Service } from "./generics/service";

@injectable()
export class PublicHolidayService extends Service<PublicHoliday, IPublicHolidayResponse, IPublicHolidayRequest> {
    constructor(@inject('PublicHolidayRepository') private readonly publicHolidayRepository: PublicHolidayRepository) {
        super(publicHolidayRepository, () => new PublicHoliday)
     }

}
