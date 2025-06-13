import { inject, injectable } from "tsyringe";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ControllerBase } from "./generics/controller-base";
import { CommonRoutes } from "../constants/commonRoutes";
import { IFetchRequest, IFilter, IEmployeeRequest, IEmployeeResponse, IGetSingleRecordFilter} from "../models";
import { ExtendedRequest } from "../models/inerfaces/extended-Request";
import { EmployeeService } from "../bl";
import { authorize } from "../middlewares/authentication";
import { payloadValidator, bodyValidator, queryValidator, paramsValidator } from "../middlewares/payload-validator";
import { uuidParamSchema, createEmployeeSchema, updateEmployeeSchema} from "../models/payload-schemas";
import { AppResponse } from "../utility";


@injectable()
export class EmployeeController extends ControllerBase {
    constructor(@inject('EmployeeService') private readonly employeeService: EmployeeService){
        super('/employee');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                middlewares: [bodyValidator(createEmployeeSchema)],
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
                    bodyValidator(updateEmployeeSchema)
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
                path: `stats`,
                handler: this.getStats as RouteHandlerMethod
            }

        ];

    }


    private add = async (req: FastifyRequest<{Body: IEmployeeRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(
                AppResponse.success(
                    "Employee created successfully",
                    await this.employeeService.add(req.body, request.user),
                )
            )
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<IEmployeeRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(
                AppResponse.success(
                    "Fetched all employees successfully",
                    await this.employeeService.get(request.user, req.body)
                )
            );
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(
                AppResponse.success(
                    "Fetched employee by ID successfully",
                    await this.employeeService.getById(req.params.id, request.user)
                )
            );
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: IGetSingleRecordFilter<IEmployeeRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(
              AppResponse.success(
                  "Fetched employee by query successfully",
                  await this.employeeService.getOne(request.user, req.body)
              )
          );
        }
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(
              AppResponse.success(
                  "Deleted employee successfully",
                  await this.employeeService.delete(req.params.id, request.user)
              )
          );
        }
    }

    private update = async (req: FastifyRequest<{Body: IEmployeeRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(
              AppResponse.success(
                  "Updated employee successfully",
                  await this.employeeService.update(req.params.id, req.body, request.user)
              )
          );
        }
    }

    private getStats = async (req: FastifyRequest, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
            res.send(
                AppResponse.success(
                    "Fetched employee stats successfully",
                    await this.employeeService.getStats(request.user)
                )
            );
        }
    }

}