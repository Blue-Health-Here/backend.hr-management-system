import { Column, Entity, JoinColumn, ManyToOne, Index, Unique } from "typeorm";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { IToResponseBase } from "./abstractions/to-response-base";
import { User } from "./user";
import { LeaveType } from "./leave-type";
import { ITokenUser, VacationStatus, VacationProgressStatus, IVacationRequest, IVacationResponse } from "../models";



// ========================= VACATION ENTITY =========================
@Entity('Vacation')
@Unique(['requestedBy', 'fromDate', 'toDate', 'companyId', 'typeId'])
@Index(['requestedBy', 'fromDate', 'toDate'])
@Index(['status', 'companyId'])
@Index(['typeId', 'status'])
export class Vacation extends CompanyEntityBase implements IToResponseBase<Vacation, IVacationResponse> {

    @Column({ type: 'uuid', nullable: false })
    requestedBy!: string;

    @Column({ type: 'date', nullable: false })
    fromDate!: Date;

    @Column({ type: 'date', nullable: false })
    toDate!: Date;

    @Column({ type: 'int', nullable: false })
    totalDays!: number;

    @Column({ type: 'text', nullable: false })
    reason!: string;

    @Column({ type: 'uuid', nullable: false })
    typeId!: string;

    @Column({ type: 'uuid', nullable: true })
    approvedBy?: string;

    @Column({ type: 'timestamp', nullable: true })
    approvedAt?: Date;

    @Column({ 
        type: 'enum', 
        enum: VacationStatus,
        default: VacationStatus.Pending,
        nullable: false 
    })
    status!: VacationStatus;

    @Column({ 
        type: 'enum', 
        enum: VacationProgressStatus,
        default: VacationProgressStatus.InProgress,
        nullable: true 
    })
    progressStatus?: VacationProgressStatus;

    @Column({ type: 'text', nullable: true })
    rejectionReason?: string;

    // Relations
    @ManyToOne(() => User, { nullable: false, eager: false })
    @JoinColumn({ name: 'requestedBy', referencedColumnName: 'id' })
    requestedByUser!: User;

    @ManyToOne(() => User, { nullable: true, eager: false })
    @JoinColumn({ name: 'approvedBy', referencedColumnName: 'id' })
    approvedByUser?: User;

    @ManyToOne(() => LeaveType, { nullable: false, eager: false })
    @JoinColumn({ name: 'typeId', referencedColumnName: 'id' })
    leaveType!: LeaveType;

    // ========================= RESPONSE MAPPING =========================
    toResponse(entity?: Vacation): IVacationResponse {
        if (!entity) entity = this;
        
        return {
            ...super.toCompanyResponseBase(entity),
            requestedBy: entity.requestedBy,
            fromDate: entity.fromDate,
            toDate: entity.toDate,
            totalDays: entity.totalDays,
            reason: entity.reason,
            typeId: entity.typeId,
            approvedBy: entity.approvedBy,
            approvedAt: entity.approvedAt,
            status: entity.status,
            progressStatus: entity.progressStatus,
            rejectionReason: entity.rejectionReason,
            requestedByUser: entity.requestedByUser ? entity.requestedByUser.toResponse() : undefined,
            approvedByUser: entity.approvedByUser ? entity.approvedByUser.toResponse() : undefined,
            leaveType: entity.leaveType ? entity.leaveType.toResponse() : undefined
        };
    }

    // ========================= ENTITY MAPPING =========================
    toEntity(requestEntity: IVacationRequest, id?: string, contextUser?: ITokenUser): Vacation {
        this.requestedBy = requestEntity.requestedBy;
        this.fromDate = requestEntity.fromDate;
        this.toDate = requestEntity.toDate;
        this.totalDays = this.calculateTotalDays();
        this.reason = requestEntity.reason;
        this.typeId = requestEntity.typeId;
        this.approvedBy = requestEntity.approvedBy;
        this.approvedAt = requestEntity.approvedAt;
        this.status = requestEntity.status || VacationStatus.Pending;
        this.progressStatus = requestEntity.progressStatus;
        this.rejectionReason = requestEntity.rejectionReason;
        
        if (contextUser) super.toCompanyEntity(contextUser, id);
        
        return this;
    }

    // ========================= BUSINESS LOGIC METHODS =========================

    // Calculate total vacation days (excluding weekends optionally)
    calculateTotalDays(excludeWeekends: boolean = false): number {
        const startDate = new Date(this.fromDate);
        const endDate = new Date(this.toDate);
        
        if (startDate > endDate) return 0;
        
        let totalDays = 0;
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            if (excludeWeekends) {
                const dayOfWeek = currentDate.getDay();
                // 0 = Sunday, 6 = Saturday
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    totalDays++;
                }
            } else {
                totalDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return totalDays;
    }

    // Update total days when dates change
    updateTotalDays(excludeWeekends: boolean = false): void {
        this.totalDays = this.calculateTotalDays(excludeWeekends);
    }

    // Approve vacation
    approve(approvedBy: string, approvedAt?: Date): void {
        this.status = VacationStatus.Approved;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt || new Date();
        this.rejectionReason = undefined; // Clear rejection reason if any
    }

    // Reject vacation
    reject(rejectedBy: string, rejectionReason: string): void {
        this.status = VacationStatus.Rejected;
        this.approvedBy = rejectedBy; // Store who rejected
        this.approvedAt = new Date(); // Store when rejected
        this.rejectionReason = rejectionReason;
    }

    // Cancel vacation
    cancel(): void {
        this.status = VacationStatus.Cancelled;
    }

    // Mark vacation as in progress (when vacation starts)
    markInProgress(): void {
        if (this.status === VacationStatus.Approved) {
            this.progressStatus = VacationProgressStatus.InProgress;
        }
    }

    // Mark vacation as completed (when vacation ends)
    markCompleted(): void {
        if (this.progressStatus === VacationProgressStatus.InProgress) {
            this.progressStatus = VacationProgressStatus.Completed;
        }
    }

    // Check if vacation is currently active
    isActive(): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const fromDate = new Date(this.fromDate);
        const toDate = new Date(this.toDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        return this.status === VacationStatus.Approved && 
               today >= fromDate && 
               today <= toDate;
    }

    // Check if vacation is upcoming
    isUpcoming(): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const fromDate = new Date(this.fromDate);
        fromDate.setHours(0, 0, 0, 0);
        
        return this.status === VacationStatus.Approved && today < fromDate;
    }

    // Check if vacation is past
    isPast(): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const toDate = new Date(this.toDate);
        toDate.setHours(0, 0, 0, 0);
        
        return today > toDate;
    }

    // Check if vacation can be cancelled
    canBeCancelled(): boolean {
        return [VacationStatus.Pending, VacationStatus.Approved].includes(this.status) && 
               !this.isPast();
    }

    // Check if vacation can be modified
    canBeModified(): boolean {
        return this.status === VacationStatus.Pending;
    }

    // Get vacation duration in a readable format
    getDurationText(): string {
        if (this.totalDays === 1) {
            return "1 day";
        }
        return `${this.totalDays} days`;
    }

    // Get formatted date range
    getDateRangeText(): string {
        const fromDateStr = this.fromDate.toLocaleDateString();
        const toDateStr = this.toDate.toLocaleDateString();
        
        if (fromDateStr === toDateStr) {
            return fromDateStr;
        }
        
        return `${fromDateStr} to ${toDateStr}`;
    }

    // Check if vacation overlaps with another vacation
    overlapsWith(otherVacation: Vacation): boolean {
        return !(this.toDate < otherVacation.fromDate || this.fromDate > otherVacation.toDate);
    }

    // Validate vacation dates
    validateDates(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if from date is in the past
        if (this.fromDate < today) {
            errors.push("Vacation start date cannot be in the past");
        }
        
        // Check if from date is after to date
        if (this.fromDate > this.toDate) {
            errors.push("Vacation start date cannot be after end date");
        }
        
        // Check if vacation duration is reasonable (e.g., max 365 days)
        if (this.totalDays > 365) {
            errors.push("Vacation duration cannot exceed 365 days");
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}