// Attendance Status Enum
export enum AttendanceStatus {
    Present = 'Present',
    Absent = 'Absent',
    Late = 'Late',
    HalfDay = 'Half Day',
    OnLeave = 'On Leave',
    Holiday = 'Holiday',
    DayOff = 'Day Off',
}

// Polymorphic Type Enum for Vacationable
export enum VacationableType {
    LeaveApplication = 'LeaveApplication',
    PublicHoliday = 'PublicHoliday'
}

// Break Type Enum
export enum BreakType {
    Lunch = 'Lunch Break',
    Tea = 'Tea Break',
    Meeting = 'Meeting Break',
    Prayer = 'Prayer Break',
    Personal = 'Personal Break',
    Smoking = 'Smoking Break',
    Other = 'Other'
}