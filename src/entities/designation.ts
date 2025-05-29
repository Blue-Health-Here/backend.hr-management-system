import { Column, Entity, JoinColumn, ManyToOne, Unique, BeforeInsert, BeforeUpdate } from "typeorm";
import { IDesignationRequest, IDesignationResponse, ITokenUser, DesignationStatus, LevelHierarchy } from "../models";
import { IToResponseBase } from "./abstractions/to-response-base";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { Department } from "./department";
import { generateCodeFromName, sanitizeString } from "../utility";

@Entity('Designation')
@Unique(['companyId', 'code']) // Ensure unique code per company
@Unique(['companyId', 'title']) // Ensure unique title per company
export class Designation extends CompanyEntityBase implements IToResponseBase<Designation, IDesignationResponse> {
    
    @Column({ type: 'int', nullable: true })
    departmentId?: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title!: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    code?: string;

    @Column({ type: 'text', nullable: true })
    jobDescription?: string;

    @Column({ 
        type: 'enum', 
        enum: LevelHierarchy, 
        default: LevelHierarchy.ENTRY 
    })
    levelHierarchy!: LevelHierarchy;

    @Column({ type: 'text', nullable: true })
    responsibilities?: string;

    @Column({ 
        type: 'enum', 
        enum: DesignationStatus, 
        default: DesignationStatus.ACTIVE 
    })
    status!: DesignationStatus;

    @Column({ type: 'int', nullable: true })
    sortOrder?: number;

    // Relationship with Department - nullable and SET NULL on delete
    @ManyToOne(() => Department, { 
        nullable: true, 
        eager: false,
        onDelete: 'SET NULL' // This will set departmentId to NULL when department is deleted
    })
    @JoinColumn({ name: 'departmentId', referencedColumnName: 'id' })
    department?: Department;

    @BeforeInsert()
    beforeInsert() {
        // Generate code if not provided
        if (!this.code && this.title) {
            this.title = sanitizeString(this.title);
            this.code = generateCodeFromName(this.title);
        }
    }
    
    toResponse(entity?: Designation): IDesignationResponse {
        if(!entity) entity = this;

        return {
            ...super.toCompanyResponseBase(entity),
            departmentId: entity.departmentId,
            title: entity.title,
            code: entity.code,
            jobDescription: entity.jobDescription,
            levelHierarchy: entity.levelHierarchy,
            responsibilities: entity.responsibilities,
            status: entity.status,
            sortOrder: entity.sortOrder,
            department: entity.department ? entity.department.toResponse(entity.department) : undefined
        }
    }

    toEntity = (entityRequest: IDesignationRequest, id?: string, contextUser?: ITokenUser): Designation => {
        this.departmentId = entityRequest.departmentId;
        this.title = entityRequest.title;
        this.code = entityRequest.code;
        this.jobDescription = entityRequest.jobDescription;
        this.levelHierarchy = entityRequest.levelHierarchy && typeof entityRequest.levelHierarchy === "string"
            ? (LevelHierarchy[entityRequest.levelHierarchy.toUpperCase() as keyof typeof LevelHierarchy] ?? LevelHierarchy.ENTRY)
            : (entityRequest.levelHierarchy || LevelHierarchy.ENTRY);
        this.responsibilities = entityRequest.responsibilities;
        this.status = entityRequest.status && typeof entityRequest.status === "string"
            ? (DesignationStatus[entityRequest.status.toUpperCase() as keyof typeof DesignationStatus] ?? DesignationStatus.ACTIVE)
            : (entityRequest.status || DesignationStatus.ACTIVE);
        this.sortOrder = entityRequest.sortOrder;

        // Set department if departmentId is provided
        if (entityRequest.departmentId) {
            let department = new Department();
            department.id = entityRequest.departmentId.toString();
            this.department = department;
        }

        if(contextUser) super.toCompanyEntity(contextUser, id);
        
        return this;
    }
}