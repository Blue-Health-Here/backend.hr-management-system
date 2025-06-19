// Attendance Status Enum
export enum AttendanceStatus {
    Default = 'Default',
    Present = 'Present',
    Absent = 'Absent',
    Late = 'Late',
    HalfDay = 'HalfDay',
    OnLeave = 'OnLeave',
    Holiday = 'Holiday',
    DayOff = 'DayOff',
}

export enum PresentStatus {
    CheckIn = 'CheckIn',
    CheckOut = 'CheckOut',
    OnBreak = 'OnBreak',
}

// Polymorphic Type Enum for Absence Reason
export enum AbsenceReasonType {
    Vacation = 'Vacation',
    PublicHoliday = 'PublicHoliday'
}

// Break Type Enum
export enum BreakType {
    Lunch = 'LunchBreak',
    Tea = 'TeaBreak',
    Meeting = 'MeetingBreak',
    Prayer = 'PrayerBreak',
    Personal = 'PersonalBreak',
    Smoking = 'SmokingBreak',
    Other = 'Other'
}