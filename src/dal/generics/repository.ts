import { injectable } from 'tsyringe';
import { FindManyOptions, FindOneOptions, FindOptionsRelations, FindOptionsWhere, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { IToResponseBase } from '../../entities/abstractions/to-response-base';
import { CompanyEntityBase } from '../../entities/base-entities/company-entity-base';
import { EntityBase } from '../../entities/base-entities/entity-base';
import { Actions, IDataSourceResponse, IFetchRequest, IFilter, PagedRequest, RelationLoad } from '../../models';
import { buildQuery, queryOptionsMapper, setSaurceDataResponse } from '../../utility';

@injectable()
export class GenericRepository<TEntity extends (CompanyEntityBase | EntityBase) & IToResponseBase<TEntity, TResponse>, TResponse>  {
    populateRelations: FindOptionsRelations<TEntity> = {};
    queryRunner?: QueryRunner; 
    constructor(protected readonly repository: Repository<TEntity>){

    }

    async entityCount(options?: FindOptionsWhere<TEntity> | Array<FindOptionsWhere<TEntity>>): Promise<number> {
        return this.repository.count({ where: options });
    }

    async beginTransaction(): Promise<QueryRunner> {
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        this.queryRunner = queryRunner;
        // Start the transaction
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        return queryRunner;
    }

    async rollbackTransaction(): Promise<void> {
        await this.queryRunner?.rollbackTransaction();
        await this.queryRunner?.release()
    }

    async commitTransaction(): Promise<void> {
        await this.queryRunner?.commitTransaction();
        await this.queryRunner?.release()
    }

    async firstOrDefault(options: FindOneOptions<TEntity>): Promise<TEntity | null> {
        this.loadRelations(options);
        return await this.repository.findOne(options);
    }

    async firstOrDefaultWithResponse(options: FindOneOptions<TEntity>): Promise<TResponse | null> {
        this.loadRelations(options);
        let entity = await this.repository.findOne(options);
        return entity ? entity.toResponse(entity) : null;
    }

    async getOneByQuery(options: {filters: Array<IFilter<TEntity, keyof TEntity>>, relations?: RelationLoad<TEntity>}, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, companyId?: string): Promise<TEntity | null> {
        return await this.repository.findOne({where: queryOptionsMapper(options.filters, getOnlyActive, dontGetDeleted, companyId), relations: {...this.populateRelations, ...(options.relations ?? {})}});
    }

    async getOneByQueryWithResponse(options: {filters: Array<IFilter<TEntity, keyof TEntity>>, relations?: RelationLoad<TEntity>}, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, companyId?: string): Promise<TResponse | null> {
        let entity = await this.repository.findOne({where: queryOptionsMapper(options.filters, getOnlyActive, dontGetDeleted, companyId), relations: {...this.populateRelations, ...(options.relations ?? {})}});
        return entity ? entity.toResponse(entity) : null;
    }

    async where(options?: FindManyOptions<TEntity>): Promise<Array<TEntity>> {
        options = options ?? {};
        this.loadRelations(options);
        return await this.repository.find(options);
    }

    async whereWithResponse(options?: FindManyOptions<TEntity>): Promise<Array<TResponse>> {
        options = options ?? {};
        this.loadRelations(options);
        return (await this.repository.find(options)).map(x => x.toResponse(x));
    }

    async getCompanyRecords(companyId: string, options?: FindManyOptions<TEntity>): Promise<Array<TEntity>> {
        const whereClause: FindOptionsWhere<CompanyEntityBase> = { companyId };
        if (options) {
            options = { ...options, where: { ...(options.where as FindOptionsWhere<TEntity>), ...whereClause } }
        }
        else {
            options = { where: whereClause as FindOptionsWhere<TEntity> };
        }
        options = options ?? {};
        this.loadRelations(options);
        return await this.repository.find(options);
    }

    async singleOrDefault(options?: FindOptionsWhere<TEntity>): Promise<TEntity | null> {
        let optionsLoad: FindOneOptions<TEntity> = { where: options };
        this.loadRelations(optionsLoad);
        const entities = await this.repository.find(optionsLoad);
        if (entities.length === 1) return entities[0];
        else if (entities.length > 1) throw new Error('Entity exists more than once.');
        else return null;
    }

    async singleOrDefaultWithResponse(options?: FindOptionsWhere<TEntity>): Promise<TResponse | null> {
        const entity = await this.singleOrDefault(options);
        return entity ? entity.toResponse(entity) : null;
    }

    async findOneById(id: string): Promise<TEntity | null> {
        let options: FindOneOptions<TEntity> = { where: { id: id as any} };
        this.loadRelations(options)
        return await this.repository.findOne(options);
    }

    async findOneByIdWithResponse(id: string): Promise<TResponse | null> {
        let entity = await this.repository.findOneBy({ id: id as any });
        return entity ? entity.toResponse(entity) : null;
    }

    async max(): Promise<TEntity | null> {
        const entities = await this.repository.find();
        return entities.reduce((max, entity) => (max.createdAt > entity.createdAt ? max : entity), entities[0]);
    }

    async getPagedData(fetchRequest: IFetchRequest<TEntity>, getOnlyActive: boolean = false, dontGetDeleted: boolean = true, companyId?: string): Promise<IDataSourceResponse<TResponse>> {
        
        if (!fetchRequest.pagedListRequest) fetchRequest.pagedListRequest = new PagedRequest();
        
        const query = buildQuery(fetchRequest, getOnlyActive, dontGetDeleted, companyId);
        const entities = await this.repository.find(query);
        const totalRecords = await this.entityCount(query.where);
        return setSaurceDataResponse<TEntity, TResponse>(entities, totalRecords, fetchRequest?.pagedListRequest?.pageSize, fetchRequest?.pagedListRequest?.pageNo);
    }

    async partialUpdate(id: string, partialEntity: QueryDeepPartialEntity<TEntity>): Promise<TEntity> {
        try {
            const result = await this.repository.update(id, partialEntity);
            let updatedRecord = await this.findOneById(id); 
            if(result.affected !== 1 || !updatedRecord) throw new Error(`An error occurred while updating`);
            return updatedRecord;
        } catch (error) {
            throw new Error(`An error occurred while updating`);
        }
    }

    async invokeDbOperations(entity: TEntity, action: Actions): Promise<TEntity> {
        switch (action) {
            case Actions.Add:
                return await this.add(entity);
            case Actions.Delete:
                return await this.deleteRecord(entity);
            case Actions.Update:
                return await this.updateEntity(entity);
            default:
                return entity;
        }
    }
    
    async invokeDbOperationsWithResponse(entity: TEntity, action: Actions): Promise<TResponse> {
        return (await this.invokeDbOperations(entity, action)).toResponse();
    }

    async invokeDbOperationsRange(entities: TEntity[], action: Actions): Promise<TEntity[]> {
        switch (action) {
            case Actions.Add:
                return this.addRange(entities);
            case Actions.Delete:
                return this.deleteRange(entities);
            case Actions.Update:
                return this.updateRange(entities);
            default:
                return entities;
        }
    }

    async invokeDbOperationsRangeWithResponse(entities: TEntity[], action: Actions): Promise<TResponse[]> {
        return (await this.invokeDbOperationsRange(entities, action)).map(x => x.toResponse())
    }

    protected async add(entity: TEntity): Promise<TEntity> {
        if(this.queryRunner) return await this.queryRunner.manager.save(entity);
        return await this.repository.save(entity);
    }

    protected async addRange(entities: TEntity[]): Promise<TEntity[]> {
        if(this.queryRunner) return await this.queryRunner.manager.save(entities);
        return await this.repository.save(entities);
    }

    protected async updateEntity(entity: TEntity): Promise<TEntity> {
        if(this.queryRunner) await this.queryRunner.manager.save(entity);
        else await this.repository.save(entity);
        return entity;
    }

    protected async updateRange(entities: TEntity[]): Promise<TEntity[]> {
        if(this.queryRunner) return await this.queryRunner.manager.save(entities);
        return await this.repository.save(entities);
    }

    private async deleteRecord(entity: TEntity): Promise<TEntity> {
        if(this.queryRunner)  await this.queryRunner.manager.remove(entity);
        await this.repository.remove(entity);
        return entity;
    }

    protected async deleteRange(entities: TEntity[]): Promise<TEntity[]> {
        if(this.queryRunner)  await this.queryRunner.manager.remove(entities);
        await this.repository.remove(entities);
        return entities;
    }

    protected loadRelations(options: FindOneOptions<TEntity> | FindManyOptions<TEntity>){
        if(Object.entries(this.populateRelations).length){
            options.relations = options.relations ? {...options.relations, ...this.populateRelations} : this.populateRelations;
        }
    }

    queryBuilder(alias: string): SelectQueryBuilder<TEntity> {
        return this.repository.createQueryBuilder(alias);
    }
}
