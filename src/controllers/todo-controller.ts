import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { ToDoService } from "../bl";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest } from "../models/inerfaces/extended-Request";
import { IFetchRequest, IFilter, IGetSingleRecordFilter, IToDoRequest, todoRequestSchema } from "../models";
import { ToDo } from "../entities";
import { CommonRoutes } from "../constants/commonRoutes";
import { authorize } from "../middlewares/authentication";
import { payloadValidator } from "../middlewares";

@injectable()
export class ToDoController extends ControllerBase {
    constructor(@inject('ToDoService') private readonly toDoService: ToDoService){
        super('/toDo');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                middlewares: [payloadValidator(todoRequestSchema)],
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
                handler: this.update as RouteHandlerMethod
            },
            {
                method: 'PUT',
                path: `complete/:id`,
                handler: this.complete as RouteHandlerMethod
            },
            {
                method: 'PUT',
                path: `incomplete/:id`,
                handler: this.incomplete as RouteHandlerMethod
            },
            {
                method: 'DELETE',
                path: `${CommonRoutes.delete}/:id`,
                handler: this.delete as RouteHandlerMethod
            }
        ];

    }

    
    private add = async (req: FastifyRequest<{Body: IToDoRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.toDoService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<IToDoRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.toDoService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.toDoService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: IGetSingleRecordFilter<IToDoRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.toDoService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.toDoService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: IToDoRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.toDoService.update(req.params.id, req.body, request.user));
        }  
    }

    private complete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.toDoService.partialUpdate(req.params.id, {completed: true}, request.user));
        }  
    }

    private incomplete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.toDoService.partialUpdate(req.params.id, {completed: false}, request.user));
        }  
    }
}