import { injectable, inject } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { CompanyService } from "../bl";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { ICompanyRequest, IFetchRequest, IFilter, RelationLoad } from "../models";
import { ExtendedRequest } from "../models/inerfaces/extended-Request";
import { CommonRoutes } from "../constants/commonRoutes";
import { authorize, hasPermission } from "../middlewares/index";

@injectable()
export class CompanyController extends ControllerBase {
    constructor(@inject('CompanyService') private readonly companyService: CompanyService) {
        super('/company');
        this.middleware = authorize as preHandlerHookHandler;
        this.endPoints = [
            {
                method: 'POST',
                path: CommonRoutes.create,
                middlewares: [ hasPermission('createCompany') as preHandlerHookHandler],
                handler: this.addCompany as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: CommonRoutes.getAll,
                middlewares: [hasPermission('getCompany') as preHandlerHookHandler],
                handler: this.getAll as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: `${CommonRoutes.getById}/:id`,
                middlewares: [hasPermission('getCompany') as preHandlerHookHandler],
                handler: this.getById as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: CommonRoutes.getOneByQuery,
                middlewares: [hasPermission('getCompany') as preHandlerHookHandler],
                handler: this.getOneByQuery as RouteHandlerMethod
            },
            {
                method: 'PUT',
                path: `${CommonRoutes.update}/:id`,
                middlewares: [hasPermission('updateCompany') as preHandlerHookHandler],
                handler: this.update as RouteHandlerMethod
            },
            {
                method: 'DELETE',
                path: `${CommonRoutes.delete}/:id`,
                middlewares: [hasPermission('deleteCompany') as preHandlerHookHandler],
                handler: this.delete as RouteHandlerMethod
            }
        ];
    }

    private addCompany = async (req: FastifyRequest<{Body: ICompanyRequest}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;
        res.send(await this.companyService.addNewCompany(req.body, request.user));
    }

    private getAll = async (req: FastifyRequest<{Body: IFetchRequest<ICompanyRequest> | undefined}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.companyService.get(request.user, req.body))
        if(request.user){
        }
    }

    private getById = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        res.send(await this.companyService.getById(req.params.id, request.user));
        if(request.user){
        }
    }

    private getOneByQuery = async (req: FastifyRequest<{Body: {filters:Array<IFilter<ICompanyRequest, keyof ICompanyRequest>>, relations?: RelationLoad<ICompanyRequest>}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.companyService.getOne(request.user, req.body));
        }    
    }

    private delete = async (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.companyService.delete(req.params.id, request.user));
        }       
    }

    private update = async (req: FastifyRequest<{Body: ICompanyRequest, Params: {id: string}}>, res: FastifyReply) => {
        let request = req as ExtendedRequest;

        if (request.user) {
          res.send(await this.companyService.update(req.params.id, req.body, request.user));
        }  
    }

}