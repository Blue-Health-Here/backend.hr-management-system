import { inject, injectable } from "tsyringe";
import { WorkingDaysRepository } from "../dal";
import { WorkingDays } from "../entities";
import { ITokenUser, IWorkingDaysRequest, IWorkingDaysResponse } from "../models";
import { Service } from "./generics/service";
import { Not } from "typeorm";
import { AppError } from "../utility/app-error";

@injectable()
export class WorkingDaysService extends Service<WorkingDays, IWorkingDaysResponse, IWorkingDaysRequest> {
    constructor(@inject('WorkingDaysRepository') private readonly workingDaysRepository: WorkingDaysRepository) {
        super(workingDaysRepository, () => new WorkingDays())
    }

    async update(id: string, entityRequest: IWorkingDaysRequest, contextUser: ITokenUser): Promise<IWorkingDaysResponse> {
        const { dayName } = entityRequest;

        if (dayName) {
            const duplicate = await this.workingDaysRepository.firstOrDefault({
                where: [{ dayName, id: Not(id) }]
            });

            if (duplicate) {
                throw new AppError(`Working day with name ${dayName} already exists`, '409');
            }

            entityRequest = { ...entityRequest, dayOfWeek: WorkingDays.getDayNumber(dayName) };
        }

        return super.update(id, entityRequest, contextUser);
    }
}
