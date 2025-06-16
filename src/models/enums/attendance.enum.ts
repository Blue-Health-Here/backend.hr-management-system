// Attendance Status Enum
export enum AttendanceStatus {
    Default = 'Default',
    Present = 'Present',
    Absent = 'Absent',
    Late = 'Late',
    HalfDay = 'Half Day',
    OnLeave = 'On Leave',
    Holiday = 'Holiday',
    DayOff = 'Day Off',
}

// Polymorphic Type Enum for Absence Reason
export enum AbsenceReasonType {
    Vacation = 'Vacation',
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