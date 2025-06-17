import { inject, injectable } from "tsyringe";
import { AttendanceRepository } from "../dal";
import { IsNull } from "typeorm";
import { Attendance } from "../entities";
import { Actions, AttendanceStatus, FilterMatchModes, FilterOperators, IAttendanceRequest, IAttendanceResponse, ICheckInRequest, ICheckOutRequest, IDataSourceResponse, IFetchRequest, IStatusRequest, ITokenUser } from "../models";
import { Service } from "./generics/service";
import { AppError } from "../utility/app-error";

@injectable()
export class AttendanceService extends Service<Attendance, IAttendanceResponse, IAttendanceRequest> {
    constructor(@inject('AttendanceRepository') private readonly attendanceRepository: AttendanceRepository) {
        super(attendanceRepository, () => new Attendance())
    }

    async status(contextUser: ITokenUser, request: IStatusRequest): Promise<IAttendanceResponse> {

        // Try to find existing attendance record
        let attendanceRecord = await this.attendanceRepository.firstOrDefault({
            where: {
                employeeId: contextUser.employeeId,
                date: request.date
            }
        });

        // If not found, create a new attendance record with default status (e.g., Absent or Present)
        if (!attendanceRecord) {
            const attendanceEntity = new Attendance().toEntity(
                {
                    employeeId: contextUser.employeeId ?? (() => { throw new AppError('Employee ID is required', '400'); })(),
                    date: request.date,
                    status: AttendanceStatus.Default // Default status, can be 'Absent' or 'Present'
                },
                undefined,
                { ...contextUser }
            );

            attendanceRecord = await this.attendanceRepository.invokeDbOperations(attendanceEntity, Actions.Add);
        }

        // Return the attendance record as a response
        return attendanceRecord.toResponse();
    }

    async checkIn(contextUser: ITokenUser, request: ICheckInRequest): Promise<IAttendanceResponse> {

        let existingAttendance = await this.attendanceRepository.firstOrDefault({
            where: {
                employeeId: contextUser.employeeId,
                date: request.date
            }
        });

        if (existingAttendance) {
            if (existingAttendance.checkInTime && !existingAttendance.checkOutTime) {
                throw new AppError('Employee has already checked in for this date. Please check out first.', '400');
            }

            if (existingAttendance.checkInTime && existingAttendance.checkOutTime) {
                throw new AppError('Employee has already completed attendance for this date (both check-in and check-out done).', '400');
            }

            if (!existingAttendance.checkInTime) {
                existingAttendance.checkIn(request.date, request.checkInTime);

                let updateResponse = await this.attendanceRepository.partialUpdate(
                    existingAttendance.id,
                    {
                        checkInTime: existingAttendance.checkInTime,
                        status: existingAttendance.status // This will be 'Present' from helper method
                    },
                    { ...contextUser }
                );

                return updateResponse.toResponse();
            }
        }

        // Create new entity WITHOUT setting status manually
        let attendanceEntity = new Attendance().toEntity(
            {
                employeeId: contextUser.employeeId ?? (() => { throw new AppError('Employee ID is required', '400'); })(),
                date: request.date,
                checkInTime: request.checkInTime,
                status: AttendanceStatus.Present // Default status for new check-in
            },
            undefined,
            { ...contextUser }
        );

        let checkInResponse = await this.attendanceRepository.invokeDbOperations(attendanceEntity, Actions.Add);

        return checkInResponse.toResponse();
    }

    async checkOut(contextUser: ITokenUser, request: ICheckOutRequest): Promise<IAttendanceResponse> {

        // Get the date and employee id from the request
        let latestAttendance = await this.attendanceRepository.firstOrDefault({
            where: {
                employeeId: contextUser.employeeId,
                date: request.date,
                checkOutTime: IsNull() // Changed from checkOut to checkOutTime
            }
        });

        if (!latestAttendance) {
            throw new AppError('No check-in record found for the given employee and date.', '404');
        }

        // Call entity's checkOut method to update time and calculate working hours
        latestAttendance.checkOut(request.checkOutTime);

        // Update the record with calculated values
        let checkOutResponse = await this.attendanceRepository.partialUpdate(
            latestAttendance.id,
            {
                checkOutTime: latestAttendance.checkOutTime,
                workingHours: latestAttendance.workingHours,
                totalBreakTime: latestAttendance.totalBreakTime
            },
            { ...contextUser }
        );

        return checkOutResponse.toResponse();
    }


    async get(contextUser?: ITokenUser, fetchRequest?: IFetchRequest<IAttendanceRequest>): Promise<IDataSourceResponse<IAttendanceResponse>> {
        // first check if contextUser is employeeId exist means only employee can access his own attendance records
        if (contextUser && contextUser.employeeId) {
            // Create or modify fetchRequest to filter by employeeId
            const modifiedFetchRequest: IFetchRequest<IAttendanceRequest> = {
                ...fetchRequest,
                queryOptionsRequest: {
                    ...fetchRequest?.queryOptionsRequest,
                    filtersRequest: [
                        // Keep existing filters if any
                        ...(fetchRequest?.queryOptionsRequest?.filtersRequest || []),
                        // Add employeeId filter
                        {
                            field: 'employeeId' as keyof IAttendanceRequest,
                            matchMode: FilterMatchModes.Equal,
                            operator: FilterOperators.And,
                            value: contextUser.employeeId
                        },
                        // {
                        //     field: 'date' as keyof IAttendanceRequest,
                        //     matchMode: FilterMatchModes.Between,
                        //     operator: FilterOperators.And,
                        //     rangeValues: {
                        //         start: new Date("2025-06-15").toISOString().split("T")[0], // current date or start date
                        //         end: new Date("2025-06-16").toISOString().split("T")[0] // current date or end date
                        //     }
                        // }
                    ]
                },
            };
            
            return super.get(contextUser, modifiedFetchRequest);
        }

        // If no employeeId in context, return all records (admin/manager access)
        return super.get(contextUser, fetchRequest);
    }

}