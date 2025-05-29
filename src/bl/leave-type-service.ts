import { inject, injectable } from "tsyringe";
import { LeaveTypeRepository } from "../dal";
import { LeaveType } from "../entities";
import { ILeaveTypeRequest, ILeaveTypeResponse, ITokenUser } from "../models";
import { Service } from "./generics/service";
import { generateCodeFromName, sanitizeString } from "../utility";
import { AppError } from "../utility/app-error";
import { Not } from "typeorm";

@injectable()
export class LeaveTypeService extends Service<LeaveType, ILeaveTypeResponse, ILeaveTypeRequest> {
    constructor(@inject('LeaveTypeRepository') private readonly leaveTypeRepository: LeaveTypeRepository) {
        super(leaveTypeRepository, () => new LeaveType())
    }

    async update(id: string, request: ILeaveTypeRequest, contextUser: ITokenUser): Promise<ILeaveTypeResponse> {
        let { name } = request;
        name = sanitizeString(name);
        const camelCasedName = generateCodeFromName(name);

        const existing = await this.leaveTypeRepository.firstOrDefault({
            where: [
                { name: name, id: Not(id) },
                { code: camelCasedName, id: Not(id) }
            ]
        });

        if (existing) {
            throw new AppError(`LeaveType with name ${name} already exists`, '409');
        }

        request.code = camelCasedName;

        return super.update(id, request, contextUser);
    }

}
