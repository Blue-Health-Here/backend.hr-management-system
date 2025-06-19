import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, Unique } from "typeorm";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { IToResponseBase } from "./abstractions/to-response-base";
import { EmployeeStatus, IEmployeeRequest, IEmployeeResponse } from "../models";
import { User } from "./user";
import { Department } from "./department";
import { Designation, } from "./designation";
import { ITokenUser } from "../models/inerfaces/tokenUser";

@Entity('Employee')
@Unique(['companyId', 'employeeCode'])
export class Employee extends CompanyEntityBase implements IToResponseBase<Employee, IEmployeeResponse> {
    
    // User Reference (One-to-One relationship)
    @Column({ type: 'uuid', nullable: false })
    userId!: string;

    // Unique Employee Code
    @Column({ type: 'text', nullable: false })
    employeeCode!: string;

    // Department Reference
    @Column({ type: 'uuid', nullable: false })
    departmentId!: string;

    // Designation Reference
    @Column({ type: 'uuid', nullable: false })
    designationId!: string;

    // Employment Details
    @Column({ type: 'date', nullable: false })
    joiningDate!: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    salary?: number;

    @Column({ type: 'date', nullable: true })
    probationEndDate?: Date;

    // Employee Status
    @Column({ 
        type: 'enum', 
        enum: EmployeeStatus,
        default: EmployeeStatus.Probation,
        nullable: false
    })
    status!: EmployeeStatus;

    // Additional Information
    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'text', nullable: true })
    phoneNumber?: string;

    @Column({ type: 'text', nullable: true })
    emergencyContact?: string;

    // Relations
    
    // User Relationship (One-to-One)
    @OneToOne(() => User, { 
        cascade: false, 
        nullable: false,
        eager: false // Load only when needed
    })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user?: User;

    // Department Relationship (Many-to-One)
    @ManyToOne(() => Department, { 
        nullable: false,
        eager: true
    })
    @JoinColumn({ name: 'departmentId', referencedColumnName: 'id' })
    department!: Department;

    // Designation Relationship (Many-to-One)
    @ManyToOne(() => Designation, { 
        nullable: false,
        eager: true
    })
    @JoinColumn({ name: 'designationId', referencedColumnName: 'id' })
    designation!: Designation;

    // Convert Entity to Response
    toResponse(entity?: Employee): IEmployeeResponse {
        if (!entity) entity = this;
        
        return {
            ...super.toCompanyResponseBase(entity),
            userId: entity.userId,
            employeeCode: entity.employeeCode,
            departmentId: entity.departmentId,
            designationId: entity.designationId,
            joiningDate: entity.joiningDate,
            salary: entity.salary,
            status: entity.status,
            address: entity.address,
            phoneNumber: entity.phoneNumber,
            emergencyContact: entity.emergencyContact,
            probationEndDate: entity.probationEndDate,
            // Related entities (will be populated if loaded)
            user: entity.user ? entity.user.toResponse() : undefined,
            department: entity.department ? entity.department.toResponse() : undefined,
            designation: entity.designation ? entity.designation.toResponse() : undefined,
        };
    }

    // Convert Request to Entity
    toEntity(requestEntity: IEmployeeRequest, id?: string, contextUser?: ITokenUser): Employee {
        this.userId = requestEntity.userId;
        this.employeeCode = requestEntity.employeeCode;
        this.departmentId = requestEntity.departmentId;
        this.designationId = requestEntity.designationId;
        this.joiningDate = requestEntity.joiningDate;
        this.salary = requestEntity.salary;
        this.status = requestEntity.status ?? EmployeeStatus.Probation;
        this.address = requestEntity.address;
        this.phoneNumber = requestEntity.phoneNumber;
        this.emergencyContact = requestEntity.emergencyContact;
        this.probationEndDate = requestEntity.probationEndDate;
        
        if (contextUser) super.toCompanyEntity(contextUser, id);
        
        return this;
    }

    // Helper Methods

    // Check if employee is active
    isActive(): boolean {
        return this.active === true
    }

    // Check if employee is on probation
    isOnProbation(): boolean {
        return this.status === EmployeeStatus.Probation;
    }

    // Get full name from user
    getFullName(): string {
        if (!this.user) return '';
        return `${this.user.firstName} ${this.user.middleName || ''} ${this.user.lastName}`.trim();
    }

    // Calculate tenure in months
    getTenureInMonths(): number {
        const now = new Date();
        const joining = new Date(this.joiningDate);
        const diffTime = Math.abs(now.getTime() - joining.getTime());
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        return diffMonths;
    }

    // Enhanced onStatusChange method with better logging
    onStatusChange(newStatus: EmployeeStatus): void {
        // Update the status
        this.status = newStatus;

        // If the new status is retired, resigned, or terminated, set active to false
        if ([EmployeeStatus.Retired, EmployeeStatus.Resigned, EmployeeStatus.Terminated].includes(newStatus)) {
            this.active = false;
        } else {
            // For other statuses (like Active, OnLeave, etc.), you might want to set active to true
            this.active = true;
        }

    }
}