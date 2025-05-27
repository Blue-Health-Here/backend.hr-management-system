import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique, BeforeInsert, BeforeUpdate } from "typeorm";
import { IDepartmentRequest, IDepartmentResponse, ITokenUser, DepartmentStatus } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { generateCodeFromName, sanitizeString } from "../utility";

@Entity('Department')
@Unique(['companyId', 'code'])
@Unique(['companyId', 'name'])
export class Department extends CompanyEntityBase implements IToResponseBase<Department, IDepartmentResponse> {
    
    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    code?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'int', nullable: true })
    parentId?: number;

    @Column({ 
        type: 'enum', 
        enum: DepartmentStatus, 
        default: DepartmentStatus.ACTIVE 
    })
    status!: DepartmentStatus;

    @Column({ type: 'int', nullable: true })
    sortOrder?: number;

    // Self-referencing relationship for hierarchical departments
    @ManyToOne(() => Department, (department) => department.children, { 
        nullable: true, 
        eager: false 
    })
    @JoinColumn({ name: 'parentId', referencedColumnName: 'id' })
    parent?: Department;

    @OneToMany(() => Department, (department) => department.parent)
    children!: Department[];

    @BeforeInsert()
    beforeInsert() {
        // Generate code if not provided
        if (!this.code && this.name) {
            this.name = sanitizeString(this.name);
            this.code = generateCodeFromName(this.name);
        }
    }
    
    toResponse(entity?: Department): IDepartmentResponse {
        if(!entity) entity = this;

        return {
            ...super.toCompanyResponseBase(entity),
            name: entity.name,
            code: entity.code,
            description: entity.description,
            parentId: entity.parentId,
            status: entity.status,
            sortOrder: entity.sortOrder,
            parent: entity.parent ? entity.parent.toResponse(entity.parent) : undefined,
            children: entity.children ? entity.children.map(child => child.toResponse(child)) : []
        }
    }

    toEntity = (entityRequest: IDepartmentRequest, id?: string, contextUser?: ITokenUser): Department => {
        this.name = entityRequest.name;
        this.code = entityRequest.code;
        this.description = entityRequest.description;
        this.parentId = entityRequest.parentId;
        this.status = entityRequest.status && typeof entityRequest.status === "string"
            ? (DepartmentStatus[entityRequest.status.toUpperCase() as keyof typeof DepartmentStatus] ?? DepartmentStatus.ACTIVE)
            : (entityRequest.status || DepartmentStatus.ACTIVE);
        this.sortOrder = entityRequest.sortOrder;

        // Set parent department if parentId is provided
        if (entityRequest.parentId) {
            let parent = new Department();
            parent.id = entityRequest.parentId.toString();
            this.parent = parent;
        }

        if(contextUser) super.toCompanyEntity(contextUser, id);
        
        return this;
    }
}