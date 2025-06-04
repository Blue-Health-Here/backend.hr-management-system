import { inject, injectable } from "tsyringe";
import { AttendanceRepository } from "../dal";
import { Attendance } from "../entities";
import { IAttendanceRequest, IAttendanceResponse } from "../models";
import { Service } from "./generics/service";

@injectable()
export class AttendanceService extends Service<Attendance, IAttendanceResponse, IAttendanceRequest> {
    constructor(@inject('AttendanceRepository') private readonly attendanceRepository: AttendanceRepository) {
        super(attendanceRepository, () => new Attendance())
    }

}
