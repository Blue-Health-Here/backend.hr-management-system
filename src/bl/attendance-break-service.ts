import { inject, injectable } from "tsyringe";
import { AttendanceBreakRepository } from "../dal";
import { AttendanceBreak } from "../entities";
import { IBreakRequest, IBreakResponse} from "../models";
import { Service } from "./generics/service";

@injectable()
export class AttendanceBreakService extends Service<AttendanceBreak, IBreakResponse, IBreakRequest> {
    constructor(@inject('AttendanceBreakRepository') private readonly attendanceBreakRepository: AttendanceBreakRepository) {
        super(attendanceBreakRepository, () => new AttendanceBreak())
    }

}
