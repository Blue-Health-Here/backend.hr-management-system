import { inject, injectable } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { UserService } from "../bl";
import { CommonRoutes } from "../constants";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ExtendedRequest, IFetchRequest, IFilter, IGetSingleRecordFilter, ILoginRequest, IUserRequest } from "../models";
import { User } from "../entities";
import { authorize } from "../middlewares/authentication";
import { hasPermission } from "../middlewares/permissions";

@injectable()
export class UserController extends ControllerBase {
    constructor(@inject('UserService') private readonly userService: UserService){
        super('/user');
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.add as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: CommonRoutes.getAll,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.getAll as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `${CommonRoutes.getById}/:id`,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.getById as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: CommonRoutes.getOneByQuery,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.getOneByQuery as RouteHandlerMethod
            },
            {
                method: 'PUT',
                path: `${CommonRoutes.update}/:id`,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.update as RouteHandlerMethod
            },
            {
                method: 'DELETE',
                path: `${CommonRoutes.delete}/:id`,
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.delete as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'secret',
                middlewares: [authorize as preHandlerHookHandler, hasPermission("can_view_secret") as preHandlerHookHandler],
                handler: this.secret as RouteHandlerMethod
            },
        ];

    }


    private add = async (req: FastifyRequest<{Body: IUserRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if(request.user){
            res.send(await this.userService.add(req.body, request.user))
        }
    }

    private getAll = async (req: FastifyRequest<{Body?: IFetchRequest<IUserRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.userService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.userService.getById(req.params.id));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: IGetSingleRecordFilter<IUserRequest>}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.userService.getOne(request.user, req.body));
        }    
    }
 
    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.userService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: IUserRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.userService.update(req.params.id, req.body, request.user));
        }  
    }

    private secret = async (req: FastifyRequest, res: FastifyReply) => {
        res.send({message: "You have access!"});
    }
}