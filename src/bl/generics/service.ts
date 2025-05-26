import { IRepositoryBase } from "../../dal";
import { ITokenUser, IFetchRequest, IDataSourceResponse, IFilter, Actions, RelationLoad, IGetSingleRecordFilter } from "../../models";
import { IServiceBase } from "../index";
import { CompanyEntityBase } from '../../entities/base-entities/company-entity-base';
import { EntityBase } from "../../entities";
import { IToResponseBase } from "../../entities/abstractions/to-response-base";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";
export class Service<TEntity extends (CompanyEntityBase | EntityBase ) & BasicEntityfunctions<TRequest, TResponse, TEntity>, TResponse, TRequest = TEntity> implements IServiceBase<TRequest, TResponse> {
    constructor(protected readonly repository: IRepositoryBase<TEntity, TResponse>, private createEntity: () => TEntity) {
        
    }

    async add(entityRequest: TRequest, contextUser: ITokenUser): Promise<TResponse> {
        return await this.repository.invokeDbOperationsWithResponse(this.createEntity().toEntity(entityRequest, undefined, contextUser), Actions.Add);
    }

    async addMany(entitesRequest: TRequest[], contextUser: ITokenUser): Promise<TResponse[]> {
        return await this.repository.invokeDbOperationsRangeWithResponse(entitesRequest.map(x => this.createEntity().toEntity(x, undefined, contextUser)), Actions.Add)
    }

    async get(contextUser?: ITokenUser, fetchRequest?: IFetchRequest<TRequest> | undefined): Promise<IDataSourceResponse<TResponse>> {
        return await this.repository.getPagedData(fetchRequest ? fetchRequest as any as IFetchRequest<TEntity> : {}, false, true, contextUser?.companyId);
    }

    async getOne(contextUser: ITokenUser, filtersRequest: IGetSingleRecordFilter<TRequest>): Promise<TResponse | null> {
        return await this.repository.getOneByQueryWithResponse({filters: filtersRequest.filters as Array<any> as Array<IFilter<TEntity, keyof TEntity>>, relations: filtersRequest.relations as RelationLoad<TEntity> | undefined }, false, false, contextUser.companyId);
    }

    async getById(id: string, contextUser?: ITokenUser): Promise<TResponse | null> {
        return await this.repository.findOneByIdWithResponse(id);
    }

    async update(id: string, entityRequest: TRequest, contextUser: ITokenUser): Promise<TResponse> {
        let updatedModel: Partial<TEntity> = {
            ...entityRequest as Partial<TEntity>,
            modifiedAt: new Date,
            modifiedBy: contextUser.name,
            modifiedById: contextUser.id
        } 
        return (await this.repository.partialUpdate(id, updatedModel as QueryDeepPartialEntity<TEntity>)).toResponse()
    }

    async updateMany(entitesRequest: (TRequest & { id: string; })[], contextUser: ITokenUser): Promise<TResponse[]> {
        return await this.repository.invokeDbOperationsRangeWithResponse(entitesRequest as any as Array<TEntity>, Actions.Add);
    }

    async delete(id: string, contextUser: ITokenUser): Promise<void> {
        let entity = this.createEntity();
        entity.id = id;
        await this.repository.invokeDbOperationsWithResponse(entity, Actions.Delete);
    }

    async deleteMany(ids: Array<string>, contextUser: ITokenUser): Promise<void> {
        await this.repository.invokeDbOperationsRangeWithResponse(ids.map( x => {
            let entity = this.createEntity();
            entity.id = x;
            return entity;        
        }), Actions.Delete)
    }

    async partialUpdate(id: string, partialEntity: Partial<TRequest>, contextUser: ITokenUser): Promise<TResponse> {
        return (await this.repository.partialUpdate(id, partialEntity as QueryDeepPartialEntity<TEntity>)).toResponse();
    }
    
} 

type BasicEntityfunctions<TRequest, TResponse, TEntity extends (CompanyEntityBase | EntityBase ) > = IToResponseBase<TEntity, TResponse> & {toEntity: (requestEntity: TRequest, id?: string, contextUser?: ITokenUser) => TEntity };