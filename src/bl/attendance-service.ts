import moment from 'moment-timezone';

import { inject, injectable } from "tsyringe";
import { AttendanceRepository, EmployeeRepository } from "../dal";
import { IsNull, In } from "typeorm";
import { Attendance } from "../entities";
import { Actions, AttendanceStatus, FilterMatchModes, FilterOperators, IAttendanceRequest, IAttendanceResponse, ICheckInRequest, ICheckOutRequest, IDataSourceResponse, IFetchRequest, IStatusRequest, ITokenUser, IAttendanceStatsResponse, EmployeeStatus, PresentStatus } from "../models";
import { Service } from "./generics/service";
import { AppError } from "../utility/app-error";

@injectable()
export class AttendanceService extends Service<Attendance, IAttendanceResponse, IAttendanceRequest> {
    constructor(
        @inject('AttendanceRepository') private readonly attendanceRepository: AttendanceRepository,
        @inject('EmployeeRepository') private readonly employeeRepository: EmployeeRepository
    ) {
        super(attendanceRepository, () => new Attendance())
    }

    private async defaultAttendanceRecord(contextUser: ITokenUser): Promise<{ created: number; existing: number }> {
        // Get all employees of the company 
        const employees = await this.employeeRepository.getCompanyRecords(contextUser.companyId, {
            where: {
                active: true,
                status: In([EmployeeStatus.Permanent, EmployeeStatus.Contract, EmployeeStatus.Probation])
            }
        });

        // Set 'today' to midnight in Pakistan timezone
        const today = new Date(moment().tz('Asia/Karachi').format('YYYY-MM-DD'));

        const employeeUserIds = employees.map(emp => emp.userId);

        // Get all existing attendance records for today for all employees at once
        const existingRecords = await this.attendanceRepository.where({
            where: {
                userId: In(employeeUserIds),
                date: today
            }
        });

        const existingRecordsArray = Array.isArray(existingRecords) ? existingRecords : (existingRecords ? [existingRecords] : []);
        const existingRecordsMap = new Map(
            existingRecordsArray.map(record => [record.userId, record])
        );

        const employeesWithoutRecords = employees.filter(
            emp => !existingRecordsMap.has(emp.userId)
        );

        const defaultAttendanceEntities = employeesWithoutRecords.map(employee =>
            new Attendance().toEntity(
                {
                    userId: employee.userId,
                    date: today,
                    status: AttendanceStatus.Default
                },
                undefined,
                { ...contextUser }
            )
        );

        let newlyCreatedRecords: IAttendanceResponse[] = [];
        if (defaultAttendanceEntities.length > 0) {
            newlyCreatedRecords = await this.addMany(
                defaultAttendanceEntities,
                contextUser
            );
        }

        return {
            created: newlyCreatedRecords.length,
            existing: existingRecordsArray.length
        };
    }

    public async status(contextUser: ITokenUser, request: IStatusRequest): Promise<IAttendanceResponse> {

        // Try to find existing attendance record
        let attendanceRecord = await this.attendanceRepository.firstOrDefault({
            where: {
                userId: contextUser.id,
                date: request.date
            }
        });

        // If not found, create a new attendance record with default status (e.g., Absent or Present)
        if (!attendanceRecord) {
            const attendanceEntity = new Attendance().toEntity(
                {
                    userId: contextUser.id ?? (() => { throw new AppError('User ID is required', '400'); })(),
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

    public async checkIn(contextUser: ITokenUser, request: ICheckInRequest): Promise<IAttendanceResponse> {

        let existingAttendance = await this.attendanceRepository.firstOrDefault({
            where: {
                userId: contextUser.id,
                date: request.date
            }
        });

        if (existingAttendance) {
            if (existingAttendance.checkInTime && !existingAttendance.checkOutTime) {
                throw new AppError('User has already checked in for this date. Please check out first.', '400');
            }

            if (existingAttendance.checkInTime && existingAttendance.checkOutTime) {
                throw new AppError('User has already completed attendance for this date (both check-in and check-out done).', '400');
            }

            if (!existingAttendance.checkInTime) {
                existingAttendance.checkIn(request.date, request.checkInTime);

                let updateResponse = await this.attendanceRepository.partialUpdate(
                    existingAttendance.id,
                    {
                        ...existingAttendance
                    },
                    { ...contextUser }
                );

                return updateResponse.toResponse();
            }
        }

        // Create new entity WITHOUT setting status manually
        let attendanceEntity = new Attendance().toEntity(
            {
                userId: contextUser.id ?? (() => { throw new AppError('User ID is required', '400'); })(),
                date: request.date,
                checkInTime: request.checkInTime,
                status: AttendanceStatus.Present, // Default status for new check-in
                presentStatus: PresentStatus.CheckIn
            },
            undefined,
            { ...contextUser }
        );

        let checkInResponse = await this.attendanceRepository.invokeDbOperations(attendanceEntity, Actions.Add);

        return checkInResponse.toResponse();
    }

    public async checkOut(contextUser: ITokenUser, request: ICheckOutRequest): Promise<IAttendanceResponse> {

        // Get the date and employee id from the request
        let latestAttendance = await this.attendanceRepository.firstOrDefault({
            where: {
                userId: contextUser.id,
                date: request.date
            }
        });

        if (!latestAttendance) {
            throw new AppError('No check-in record found for the given user and date.', '404');
        }

        // If attendance record does not exist for the user on the given date, throw an error user not checked in
        if (!latestAttendance || !latestAttendance.checkInTime) {
            throw new AppError('User has not checked in for this date. Please check in first.', '400');
        }

        // If check-out time is already set, throw an error
        if (latestAttendance.checkOutTime && latestAttendance.presentStatus) {
            throw new AppError('User has already checked out for this date.', '400');
        }

        // If check-in time is set but present status is Break, throw an error
        if (latestAttendance.checkInTime && latestAttendance.presentStatus === PresentStatus.OnBreak){
            throw new AppError('User is currently on break and cannot check out.', '400');
        }

        // Call entity's checkOut method to update time and calculate working hours
        latestAttendance.checkOut(request.checkOutTime);

        // Update the record with calculated values
        let checkOutResponse = await this.attendanceRepository.partialUpdate(
            latestAttendance.id,
            {
                ...latestAttendance,
            },
            { ...contextUser }
        );

        return checkOutResponse.toResponse();
    }

    public async get(contextUser?: ITokenUser, fetchRequest?: IFetchRequest<IAttendanceRequest>): Promise<IDataSourceResponse<IAttendanceResponse>> {

        // Remove when proper cron job is implemented
        // Automatically create default attendance records for all employees if not present for today
        if (contextUser) {
            let result = await this.defaultAttendanceRecord(contextUser);
            console.log(`Default attendance records created: ${result.created}, Existing records: ${result.existing}`);
        }

        // first check if contextUser is userId exist means only user can access his own attendance records
        if (contextUser && contextUser.role === 'employee') {
            // Create or modify fetchRequest to filter by userId
            const modifiedFetchRequest: IFetchRequest<IAttendanceRequest> = {
                ...fetchRequest,
                queryOptionsRequest: {
                    ...fetchRequest?.queryOptionsRequest,
                    filtersRequest: [
                        // Keep existing filters if any
                        ...(fetchRequest?.queryOptionsRequest?.filtersRequest || []),
                        // Add userId filter
                        {
                            field: 'userId' as keyof IAttendanceRequest,
                            matchMode: FilterMatchModes.Equal,
                            operator: FilterOperators.And,
                            value: contextUser.id
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

        // If no userId in context, return all records (admin/manager access)
        return super.get(contextUser, fetchRequest);
    }

    // pending work 
    public async getStats(contextUser: ITokenUser, fetchRequest: IFetchRequest<IAttendanceRequest>): Promise<IAttendanceStatsResponse> {

        let attendance = await super.get(contextUser, fetchRequest);

        return {
            totalPresent: attendance.data.filter(a => a.status === AttendanceStatus.Present).length,
            totalAbsent: attendance.data.filter(a => a.status === AttendanceStatus.Absent || a.status === AttendanceStatus.Default).length
        };
    }

}