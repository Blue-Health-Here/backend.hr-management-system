import { DataSource } from "typeorm";
import { log, error } from "console";
import { Company, Country, Privilege, Role, PublicHoliday, User, ToDo, ActivityLog, AuditLog, Verification, Department, Designation, LeaveType, Employee, Attendance, AttendanceBreak, Vacation, WorkingDays, Shift, UserShift, Scheduler  } from "../../entities";
import { config } from "dotenv";
import pg from 'pg';
config();
import { AddDefaultData, superAdminSetup } from "../../utility/default-data";
import { CountryDataSeeder } from "../seeders/country-data-seeder";


export const dataSource = new DataSource({
    driver: pg,
    type: 'postgres',
    host: process.env.DB_Server ?? "",
    database: process.env.DB_DataBase ?? "",
    username: process.env.DB_userId ?? "",
    password: process.env.DB_Password ?? "",
    port: process.env.DB_Port ? parseInt(process.env.DB_Port) : 5432,
    migrations: ["src/dal/migrations/**/*.ts"],
    entities: [ Company, Country, User, Role, Privilege, ToDo, ActivityLog, AuditLog, Verification, Department, Designation, LeaveType, PublicHoliday, Employee, Attendance, AttendanceBreak, Vacation, WorkingDays, Shift, UserShift, Scheduler ],
    synchronize: true,
    ssl: process.env.NODE_ENV === "development" ? false : { rejectUnauthorized: false }
});


dataSource.initialize()
.then(async (x) => {
    // await AddDefaultData(dataSource)
    // await superAdminSetup(dataSource);

    // console.log("Running country seeder...");
    // await CountryDataSeeder.seed(dataSource);

    log("Database Connected successfully!");
})
.catch((err) =>  error("Error connecting to database", err));