import { inject, injectable } from "tsyringe";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ControllerBase } from "./generics/controller-base";
import { CommonRoutes } from "../constants/commonRoutes";
import { IFetchRequest, IFilter, IAttendanceRequest, IAttendanceResponse, IGetSingleRecordFilter, ICheckOutRequest, ICheckInRequest, IStatusRequest} from "../models";
import { ExtendedRequest } from "../models/inerfaces/extended-Request";
import { AttendanceService } from "../bl";
import { authorize } from "../middlewares/authentication";
import { payloadValidator, bodyValidator, queryValidator, paramsValidator } from "../middlewares/payload-validator";
import { uuidParamSchema, checkInSchema, checkOutSchema, statusSchema} from "../models/payload-schemas";
import { AppResponse } from "../utility";


@injectable()
export class AttendanceController extends ControllerBase {
    constructor(
        @inject('AttendanceService') private readonly attendanceService: AttendanceService
    ){
        super('/attendance');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'GET',
                path: 'status',
                middlewares: [queryValidator(statusSchema)],
                handler: this.status as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: 'check-in',  
                middlewares: [bodyValidator(checkInSchema)],
                handler: this.checkIn as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: 'check-out',
                middlewares: [bodyValidator(checkOutSchema)],
                handler: this.checkOut as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: 'stats',
                handler: this.stats as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: CommonRoutes.getAll,
                handler: this.getAll as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `${CommonRoutes.getById}/:id`,
                middlewares: [paramsValidator(uuidParamSchema)],
                handler: this.getById as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: CommonRoutes.getOneByQuery,
                handler: this.getOneByQuery as RouteHandlerMethod
            }
        ];

    }

    private status = async (req: FastifyRequest<{Querystring: IStatusRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(
                AppResponse.success(
                    "Attendance status fetched successfully",
                    await this.attendanceService.status(request.user, req.query),
                )
            );
        }
    }

    private checkIn = async (req: FastifyRequest<{Body: ICheckInRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(
                AppResponse.success(
                    "Check-in successful",
                    await this.attendanceService.checkIn(request.user, req.body)
                )
            );
        }
    }

    private checkOut = async (req: FastifyRequest<{Body: ICheckOutRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(
                AppResponse.success(
                    "Check-out successful",
                    await this.attendanceService.checkOut(request.user, req.body)
                )
            );
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<IAttendanceRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(
                AppResponse.success(
                    "Attendance records fetched successfully",
                    await this.attendanceService.get(request.user, req.body)
                )
            );
        }
    }

    private stats = async (req: FastifyRequest<{Body?: IFetchRequest<IAttendanceRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(
                AppResponse.success(
                    "Attendance stats fetched successfully",
                    await this.attendanceService.getStats(request.user, req.body ?? {})
                )
            );
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(
            AppResponse.success(
                "Attendance record fetched successfully",
                await this.attendanceService.getById(req.params.id, request.user)
            )
        );
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: IGetSingleRecordFilter<IAttendanceRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(
                AppResponse.success(
                    "Attendance record fetched successfully",
                    await this.attendanceService.getOne(request.user, req.body)
                )
            );
        }
    }


}