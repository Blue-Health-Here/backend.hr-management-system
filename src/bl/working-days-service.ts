import { inject, injectable } from "tsyringe";
import { WorkingDaysRepository } from "../dal";
import { WorkingDays } from "../entities";
import { IWorkingDaysRequest, IWorkingDaysResponse } from "../models";
import { Service } from "./generics/service";

@injectable()
export class WorkingDaysService extends Service<WorkingDays, IWorkingDaysResponse, IWorkingDaysRequest> {
    constructor(@inject('WorkingDaysRepository') private readonly workingDaysRepository: WorkingDaysRepository) {
        super(workingDaysRepository, () => new WorkingDays())
    }

}
