import { inject, injectable } from "tsyringe";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ControllerBase } from "./generics/controller-base";
import { CommonRoutes } from "../constants/commonRoutes";
import { ExtendedRequest } from "../models/inerfaces/extended-Request";
import { IFetchRequest, IFilter, IGetSingleRecordFilter, IPublicHolidayRequest, IPublicHolidayResponse } from "../models";
import { PublicHolidayService } from "../bl";
import { authorize } from "../middlewares/authentication";
import { bodyValidator, queryValidator, paramsValidator } from "../middlewares/payload-validator";
import { createPublicHolidaySchema, updatePublicHolidaySchema, uuidParamSchema, } from "../models/payload-schemas";


@injectable()
export class PublicHolidayController extends ControllerBase {
    constructor(@inject('PublicHolidayService') private readonly publicHolidayService: PublicHolidayService){
        super('/public-holiday');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                middlewares: [bodyValidator(createPublicHolidaySchema)],
                handler: this.add as RouteHandlerMethod
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
            },
            {
                method: 'PUT',
                path: `${CommonRoutes.update}/:id`,
                middlewares: [
                    paramsValidator(uuidParamSchema),
                    bodyValidator(updatePublicHolidaySchema)
                ],
                handler: this.update as RouteHandlerMethod
            },
            {
                method: 'DELETE',
                path: `${CommonRoutes.delete}/:id`,
                middlewares: [paramsValidator(uuidParamSchema)],
                handler: this.delete as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `${CommonRoutes.getById}/:id/departments`,
                middlewares: [paramsValidator(uuidParamSchema)],
                handler: this.getPublicHolidayWithDepartments as RouteHandlerMethod
            }
        ];

    }


    private add = async (req: FastifyRequest<{Body: IPublicHolidayRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.publicHolidayService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<IPublicHolidayRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.publicHolidayService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.publicHolidayService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: IGetSingleRecordFilter<IPublicHolidayRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.publicHolidayService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.publicHolidayService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: IPublicHolidayRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.publicHolidayService.update(req.params.id, req.body, request.user));
        }  
    }

    private getPublicHolidayWithDepartments = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(await this.publicHolidayService.getPublicHolidayWithDepartments(req.params.id, request.user));
        }
    }

}