import { inject, injectable } from "tsyringe";
import { PublicHolidayRepository } from "../dal";
import { PublicHoliday } from "../entities";
import { IPublicHolidayRequest, IPublicHolidayResponse, ITokenUser } from "../models";
import { Service } from "./generics/service";

@injectable()
export class PublicHolidayService extends Service<PublicHoliday, IPublicHolidayResponse, IPublicHolidayRequest> {
    constructor(@inject('PublicHolidayRepository') private readonly publicHolidayRepository: PublicHolidayRepository) {
        super(publicHolidayRepository, () => new PublicHoliday)
    }

    async getPublicHolidayWithDepartments(id: string, contextUser?: ITokenUser): Promise<IPublicHolidayResponse | null> {

        const publicHoliday = await this.publicHolidayRepository.firstOrDefault({
            where: { id },
            relations: ['departments', 'country'],
        });

        if (!publicHoliday) {
            return null;
        }

        return publicHoliday.toResponse();

    }



}
