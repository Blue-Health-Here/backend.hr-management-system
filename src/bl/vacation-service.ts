import { inject, injectable } from "tsyringe";
import { VacationRepository } from "../dal";
import { LeaveTypeService } from "../bl";
import { Vacation } from "../entities";
import { ITokenUser, IVacationRequest, IVacationResponse, VacationStatus } from "../models";
import { Service } from "./generics/service";
import { AppError } from "../utility/app-error";
import { Between, LessThanOrEqual, MoreThanOrEqual, Equal, Or, Not, In } from "typeorm";

@injectable()
export class VacationService extends Service<Vacation, IVacationResponse, IVacationRequest> {
    constructor(
        @inject('LeaveTypeService') private readonly leaveTypeService: LeaveTypeService,
        @inject('VacationRepository') private readonly vacationRepository: VacationRepository
    ) {
        super(vacationRepository, () => new Vacation())
    }


    // add vacation 
    async add(vacationRequest: IVacationRequest, contextUser: ITokenUser): Promise<IVacationResponse> {

        //  Validate type ID
        const leaveType = await this.leaveTypeService.getById(vacationRequest.typeId, contextUser);
        if (!leaveType) {
            throw new AppError(`Leave type with ID ${vacationRequest.typeId} does not exist`, '404');
        }

        // To date should be greater than or equal to from date
        if (new Date(vacationRequest.toDate) < new Date(vacationRequest.fromDate)) {
            throw new AppError('To date must be greater than or equal to from date', '400');
        }

        // check if user have already requested vacation for the same period 
        const fromDate = vacationRequest.fromDate;
        const toDate = vacationRequest.toDate;

        const existingVacation = await this.vacationRepository.firstOrDefault({
            where: [
                // Dates fall between fromDate and toDate
                { requestedBy: contextUser.id, fromDate: Between(fromDate, toDate) },
                { requestedBy: contextUser.id, toDate: Between(fromDate, toDate) },
                // fromDate and toDate cover the entire range
                { requestedBy: contextUser.id, fromDate: LessThanOrEqual(fromDate), toDate: MoreThanOrEqual(toDate) },
                // Exact match for single-day range
                { requestedBy: contextUser.id, fromDate: Equal(fromDate), toDate: Equal(toDate) }
            ]
        });

        if (existingVacation) {
            throw new AppError('You have already requested vacation for the same period', '409');
        }

        // get user previous leave type balance
        const leaveTypeBalance = await this.vacationRepository.where({
            where: {
                requestedBy: contextUser.id,
                typeId: vacationRequest.typeId,
                // not equal to cancelled or rejected
                status: Not(In([VacationStatus.Cancelled, VacationStatus.Rejected])),
            }
        });

        // Calculate total days for the leaveTypeBalance
        const alreadyTakenLeaves = leaveTypeBalance.reduce((acc, vacation) => {
            return acc + vacation.totalDays;
        }, 0);


        // final create entity object
        let vacation = new Vacation().toEntity(
            {
                ...vacationRequest,
                requestedBy: contextUser.id
            },
            undefined,
            contextUser
        );

        vacation.totalDays = vacation.calculateTotalDays(false);

        // Check if the user has enough leave balance
        if (alreadyTakenLeaves + vacation.totalDays > leaveType.maxDaysPerYear ) {
            throw new AppError('You do not have enough leave balance', '409');
        }

        return super.add(vacation, contextUser);
    }

}
