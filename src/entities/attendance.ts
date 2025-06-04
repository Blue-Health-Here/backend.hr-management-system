import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Index } from "typeorm";
import { CompanyEntityBase } from "./base-entities/company-entity-base";
import { IToResponseBase } from "./abstractions/to-response-base";
import { Employee } from "./employee";
import { ITokenUser } from "../models/inerfaces/tokenUser";
import { AttendanceBreak } from "./attendance-break";
import { AttendanceStatus, IAttendanceRequest, IAttendanceResponse } from "../models";
import { Vacation } from "./vacation"; // Make sure this import exists
import { PublicHoliday } from "./public-holiday"; // Make sure this import exists

@Entity('Attendance')
@Index(['employeeId', 'date'], { unique: true })
export class Attendance extends CompanyEntityBase implements IToResponseBase<Attendance, IAttendanceResponse> {
    
    @Column({ type: 'uuid', nullable: false })
    employeeId!: string;

    @Column({ type: 'date', nullable: false })
    date!: Date;

    @Column({ type: 'timestamp', nullable: true })
    checkInTime?: Date;

    @Column({ type: 'timestamp', nullable: true })
    checkOutTime?: Date;

    @Column({ 
        type: 'text', 
        default: AttendanceStatus.Absent,
        nullable: false 
    })
    status!: AttendanceStatus;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    workingHours?: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    totalBreakTime?: number;

    @Column({ type: 'int', default: 0 })
    lateMinutes!: number;

    @Column({ type: 'int', default: 0 })
    earlyLeaveMinutes!: number;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ type: 'text', nullable: true })
    location?: string;

    @Column({ type: 'boolean', default: false })
    isRemote!: boolean;

    // Add explicit vacation and public holiday fields
    @Column({ type: 'uuid', nullable: true })
    vacationId?: string;

    @ManyToOne(() => Vacation, { nullable: true, eager: false })
    @JoinColumn({ name: 'vacationId', referencedColumnName: 'id' })
    vacation?: Vacation;

    @Column({ type: 'uuid', nullable: true })
    publicHolidayId?: string;

    @ManyToOne(() => PublicHoliday, { nullable: true, eager: false })
    @JoinColumn({ name: 'publicHolidayId', referencedColumnName: 'id' })
    publicHoliday?: PublicHoliday;

    // Relations
    @ManyToOne(() => Employee, { nullable: false, eager: false })
    @JoinColumn({ name: 'employeeId', referencedColumnName: 'id' })
    employee!: Employee;

    @OneToMany(() => AttendanceBreak, (breakRecord) => breakRecord.attendance, { cascade: true })
    breaks!: AttendanceBreak[];

    // Virtual property to get absenceReason based on which is set
    get absenceReason(): Vacation | PublicHoliday | null {
        if (this.vacation) return this.vacation;
        if (this.publicHoliday) return this.publicHoliday;
        return null;
    }

    toResponse(entity?: Attendance): IAttendanceResponse {
        if (!entity) entity = this;
        
        return {
            ...super.toCompanyResponseBase(entity),
            employeeId: entity.employeeId,
            date: entity.date,
            checkInTime: entity.checkInTime,
            checkOutTime: entity.checkOutTime,
            status: entity.status,
            workingHours: entity.workingHours,
            totalBreakTime: entity.totalBreakTime,
            lateMinutes: entity.lateMinutes,
            notes: entity.notes,
            location: entity.location,
            isRemote: entity.isRemote,
            vacationId: entity.vacationId,
            publicHolidayId: entity.publicHolidayId,
            employee: entity.employee ? entity.employee.toResponse() : undefined,
            absenceReason: entity.absenceReason
                ? (entity.absenceReason.toResponse?.() as any)
                : undefined,
            breaks: entity.breaks ? entity.breaks.map(b => b.toResponse()) : undefined
        };
    }

    toEntity(requestEntity: IAttendanceRequest, id?: string, contextUser?: ITokenUser): Attendance {
        this.employeeId = requestEntity.employeeId;
        this.date = requestEntity.date;
        this.checkInTime = requestEntity.checkInTime;
        this.checkOutTime = requestEntity.checkOutTime;
        this.status = requestEntity.status;
        this.workingHours = requestEntity.workingHours;
        this.lateMinutes = requestEntity.lateMinutes || 0;
        this.notes = requestEntity.notes;
        this.location = requestEntity.location;
        this.isRemote = requestEntity.isRemote || false;
        this.vacationId = (requestEntity as any).vacationId;
        this.publicHolidayId = (requestEntity as any).publicHolidayId;
        
        if (contextUser) super.toCompanyEntity(contextUser, id);
        
        return this;
    }

    // Calculate total working hours excluding breaks
    calculateWorkingHours(): number {
        if (!this.checkInTime || !this.checkOutTime) return 0;

        const totalMinutes = (this.checkOutTime.getTime() - this.checkInTime.getTime()) / (1000 * 60);
        const breakMinutes = this.totalBreakTime ? this.totalBreakTime * 60 : 0;
        const workingMinutes = Math.max(0, totalMinutes - breakMinutes);
        
        return Math.round((workingMinutes / 60) * 100) / 100;
    }

    // Calculate total break time from all breaks
    calculateTotalBreakTime(): number {
        if (!this.breaks || this.breaks.length === 0) return 0;
        
        return this.breaks.reduce((total, breakRecord) => {
            return total + (breakRecord.getDurationInHours() || 0);
        }, 0);
    }

    // Check if employee is currently on break
    isCurrentlyOnBreak(): boolean {
        if (!this.breaks || this.breaks.length === 0) return false;
        return this.breaks.some(breakRecord => breakRecord.isOngoing());
    }

    // Get current active break
    getCurrentBreak(): AttendanceBreak | undefined {
        if (!this.breaks || this.breaks.length === 0) return undefined;
        return this.breaks.find(breakRecord => breakRecord.isOngoing());
    }

    // Get total number of breaks taken
    getTotalBreaksCount(): number {
        return this.breaks ? this.breaks.length : 0;
    }

    // Check if attendance is based on approved leave
    isOnApprovedLeave(): boolean {
        return this.status === AttendanceStatus.OnLeave && !!this.vacationId;
    }

    // Check if attendance is due to public holiday
    isPublicHoliday(): boolean {
        return this.status === AttendanceStatus.Holiday && !!this.publicHolidayId;
    }

    // Get attendance type for reporting
    getAttendanceType(): 'working' | 'leave' | 'holiday' | 'dayoff' | 'absent' {
        if (this.isPublicHoliday()) return 'holiday';
        if (this.isOnApprovedLeave()) return 'leave';
        if (this.status === AttendanceStatus.DayOff) return 'dayoff';
        if (this.status === AttendanceStatus.Present || this.status === AttendanceStatus.Late || this.status === AttendanceStatus.HalfDay) return 'working';
        return 'absent';
    }

    // Helper method to get absenceReason entity info
    getAbsenceReasonInfo(): { id: string; type: 'Vacation' | 'PublicHoliday' } | null {
        if (this.vacationId) return { id: this.vacationId, type: 'Vacation' };
        if (this.publicHolidayId) return { id: this.publicHolidayId, type: 'PublicHoliday' };
        return null;
    }

    // Set absenceReason reference
    setVacation(id: string): void {
        this.vacationId = id;
        this.publicHolidayId = undefined;
    }

    setPublicHoliday(id: string): void {
        this.publicHolidayId = id;
        this.vacationId = undefined;
    }

    // Clear absenceReason reference
    clearAbsenceReason(): void {
        this.vacationId = undefined;
        this.publicHolidayId = undefined;
    }

    // Check if it's a full working day
    isFullWorkingDay(): boolean {
        return this.status === AttendanceStatus.Present && 
               this.checkInTime !== undefined && 
               this.checkOutTime !== undefined;
    }

    // Auto calculate and update working hours
    updateWorkingHours(): void {
        this.totalBreakTime = this.calculateTotalBreakTime();
        this.workingHours = this.calculateWorkingHours();
    }
}