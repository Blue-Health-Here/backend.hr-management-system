import { inject, injectable } from "tsyringe";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ControllerBase } from "./generics/controller-base";
import { CommonRoutes } from "../constants/commonRoutes";
import { IFetchRequest, IFilter, IGetSingleRecordFilter, IWorkingDaysRequest, IWorkingDaysResponse} from "../models";
import { ExtendedRequest } from "../models/inerfaces/extended-Request";
import { WorkingDaysService } from "../bl";
import { authorize } from "../middlewares/authentication";
import { payloadValidator, bodyValidator, queryValidator, paramsValidator } from "../middlewares/payload-validator";
import { uuidParamSchema, createWorkingDaysSchema, updateWorkingDaysSchema} from "../models/payload-schemas";
import { AppResponse } from "../utility";

@injectable()
export class WorkingDaysController extends ControllerBase {
    constructor(@inject('WorkingDaysService') private readonly workingDaysService: WorkingDaysService){
        super('/working-days');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                middlewares: [bodyValidator(createWorkingDaysSchema)],
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
                    bodyValidator(updateWorkingDaysSchema)
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


    private add = async (req: FastifyRequest<{Body: IWorkingDaysRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(AppResponse.success(
                'Working day added successfully',
                await this.workingDaysService.add(req.body, request.user)
            ));
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<IWorkingDaysRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(AppResponse.success(
                'Working days retrieved successfully',
                await this.workingDaysService.get(request.user, req.body)
            ));
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(AppResponse.success(
                'Working day retrieved successfully',
                await this.workingDaysService.getById(req.params.id, request.user)
            ));
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: IGetSingleRecordFilter<IWorkingDaysRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(AppResponse.success(
              'Working day retrieved successfully',
              await this.workingDaysService.getOne(request.user, req.body)
          ));
        }
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(AppResponse.success(
              'Working day deleted successfully',
              await this.workingDaysService.delete(req.params.id, request.user)
          ));
        }
    }

    private update = async (req: FastifyRequest<{Body: IWorkingDaysRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(AppResponse.success(
              'Working day updated successfully',
              await this.workingDaysService.update(req.params.id, req.body, request.user)
          ));
        }
    }

}