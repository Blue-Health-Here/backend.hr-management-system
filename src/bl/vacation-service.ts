import { inject, injectable } from "tsyringe";
import { VacationRepository } from "../dal";
import { LeaveTypeService } from "../bl";
import { Vacation } from "../entities";
import { IFetchRequest,  FilterMatchModes, FilterOperators, IVacationStatusRequest, ITokenUser, IVacationRequest, IVacationResponse, VacationStatus, IDataSourceResponse } from "../models";
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

    public async get(contextUser?: ITokenUser, fetchRequest?: IFetchRequest<IVacationRequest>): Promise<IDataSourceResponse<IVacationResponse>> {
        // first check if contextUser is userId exist means only employee can access his own attendance records
        if (contextUser && contextUser.id && contextUser.role === 'employee') {
            // Create or modify fetchRequest to filter by userId
            const modifiedFetchRequest: IFetchRequest<IVacationRequest> = {
                ...fetchRequest,
                queryOptionsRequest: {
                    ...fetchRequest?.queryOptionsRequest,
                    filtersRequest: [
                        // Keep existing filters if any
                        ...(fetchRequest?.queryOptionsRequest?.filtersRequest || []),
                        // Add requestedBy filter
                        {
                            field: 'requestedBy' as keyof IVacationRequest,
                            matchMode: FilterMatchModes.Equal,
                            operator: FilterOperators.And,
                            value: contextUser.id
                        },
                    ]
                },
            };
            
            return super.get(contextUser, modifiedFetchRequest);
        }

        // If no userId in context, return all records (admin/manager access)
        return super.get(contextUser, fetchRequest);
    }

    // Update Status of Vacation
    public async updateStatus(id: string, status: IVacationStatusRequest, contextUser: ITokenUser, rejectionReason?: string): Promise<IVacationResponse> {
        // Validate if vacation exists
        const vacation = await super.getById(id, contextUser);
        if (!vacation) {
            throw new AppError(`Vacation with ID ${id} does not exist`, '404');
        }

        // Check if the user has permission to update the status
        if (contextUser.role !== 'companyAdmin' && contextUser.role !== 'manager') {
            throw new AppError('You do not have permission to update the status of this vacation', '403');
        }

        // first check if status not equls to pending
        if (vacation.status !== VacationStatus.Pending) {
            throw new AppError(`You have already ${vacation.status} this vacation`, '409');
        }

        // Update the status and rejection reason if applicable
        vacation.status = status.status;
        if (status.status === VacationStatus.Rejected) {
            vacation.rejectionReason = status.rejectionReason || rejectionReason;
        }
        vacation.approvedBy = contextUser.id;
        vacation.approvedAt = new Date();


        return super.update(id, vacation, contextUser);
    }

}
