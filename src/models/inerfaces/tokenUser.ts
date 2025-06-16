export interface ITokenUser {
    id: string;
    name: string;
    companyId: string;
    employeeId?: string;
    privileges: Array<string>
}