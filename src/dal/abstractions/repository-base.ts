import { EntityManager, FindManyOptions, FindOneOptions, FindOptionsRelations, FindOptionsWhere, QueryRunner, SelectQueryBuilder } from "typeorm";
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, RelationLoad } from "../../models";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";
import { CompanyEntityBase } from '../../entities/base-entities/company-entity-base';
import { EntityBase } from "../../entities";

export interface IRepositoryBase<TEntity extends (CompanyEntityBase | EntityBase), TResponse> {
    // Properties
    populateRelations: FindOptionsRelations<TEntity>;

    // Query Methods
    entityCount(options?: FindOptionsWhere<TEntity> | Array<FindOptionsWhere<TEntity>>): Promise<number>;
    firstOrDefault(options: FindOneOptions<TEntity>): Promise<TEntity | null>;
    firstOrDefaultWithResponse(options: FindOneOptions<TEntity>): Promise<TResponse | null>;
    getOneByQuery(
        options: {filters: Array<IFilter<TEntity, keyof TEntity>>, relations?: RelationLoad<TEntity>}, 
        getOnlyActive?: boolean, 
        dontGetDeleted?: boolean, 
        companyId?: string
    ): Promise<TEntity | null>;
    getOneByQueryWithResponse(
        options: {filters: Array<IFilter<TEntity, keyof TEntity>>, relations?: RelationLoad<TEntity>}, 
        getOnlyActive?: boolean, 
        dontGetDeleted?: boolean, 
        companyId?: string
    ): Promise<TResponse | null>;
    where(options?: FindManyOptions<TEntity>): Promise<Array<TEntity>>;
    whereWithResponse(options?: FindManyOptions<TEntity>): Promise<Array<TResponse>>;
    getCompanyRecords(companyId: string, options?: FindManyOptions<TEntity>): Promise<Array<TEntity>>;
    singleOrDefault(options?: FindOptionsWhere<TEntity>): Promise<TEntity | null>;
    singleOrDefaultWithResponse(options?: FindOptionsWhere<TEntity>): Promise<TResponse | null>;
    findOneById(id: string): Promise<TEntity | null>;
    findOneByIdWithResponse(id: string): Promise<TResponse | null>;
    max(): Promise<TEntity | null>;
    getPagedData(
        fetchRequest: IFetchRequest<TEntity>, 
        getOnlyActive?: boolean, 
        dontGetDeleted?: boolean, 
        companyId?: string
    ): Promise<IDataSourceResponse<TResponse>>;

    // Transaction Methods
    beginTransaction(): Promise<QueryRunner>;
    rollbackTransaction(): Promise<void>;
    commitTransaction(): Promise<void>;

    // Modification Methods
    partialUpdate(id: string, partialEntity: QueryDeepPartialEntity<TEntity>): Promise<TEntity>;
    invokeDbOperations(entity: TEntity, action: Actions): Promise<TEntity>;
    invokeDbOperationsWithResponse(entity: TEntity, action: Actions): Promise<TResponse>;
    invokeDbOperationsRange(entities: TEntity[], action: Actions): Promise<TEntity[]>;
    invokeDbOperationsRangeWithResponse(entities: TEntity[], action: Actions): Promise<TResponse[]>;

    // Query Builder
    queryBuilder(alias: string): SelectQueryBuilder<TEntity>;
}