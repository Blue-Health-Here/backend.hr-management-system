import { inject, injectable } from "tsyringe";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ControllerBase } from "./generics/controller-base";
import { CommonRoutes } from "../constants/commonRoutes";
import { IFetchRequest, IFilter, IGetSingleRecordFilter, IDepartmentRequest } from "../models";
import { ExtendedRequest } from "../models/inerfaces/extended-Request";
import { Department } from "../entities";
import { DepartmentService } from "../bl";
import { authorize } from "../middlewares/authentication";
import { payloadValidator, bodyValidator, queryValidator, paramsValidator } from "../middlewares/payload-validator";
import { uuidParamSchema, createDepartmentSchema, updateDepartmentSchema } from "../models/payload-schemas";


@injectable()
export class DepartmentController extends ControllerBase {
    constructor(@inject('DepartmentService') private readonly departmentService: DepartmentService){
        super('/department');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                middlewares: [bodyValidator(createDepartmentSchema)],
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
                    bodyValidator(updateDepartmentSchema)
                ],
                handler: this.update as RouteHandlerMethod
            },
            {
                method: 'DELETE',
                path: `${CommonRoutes.delete}/:id`,
                middlewares: [paramsValidator(uuidParamSchema)],
                handler: this.delete as RouteHandlerMethod
            }
        ];

    }

    
    private add = async (req: FastifyRequest<{Body: IDepartmentRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.departmentService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<IDepartmentRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.departmentService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.departmentService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: IGetSingleRecordFilter<IDepartmentRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.departmentService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.departmentService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: IDepartmentRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.departmentService.update(req.params.id, req.body, request.user));
        }  
    }

}