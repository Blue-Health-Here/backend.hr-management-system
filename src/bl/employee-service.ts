import { inject, injectable } from "tsyringe";
import { EmployeeRepository } from "../dal";
import { Employee } from "../entities";
import { IEmployeeRequest, IEmployeeResponse} from "../models";
import { Service } from "./generics/service";

@injectable()
export class EmployeeService extends Service<Employee, IEmployeeResponse, IEmployeeRequest> {
    constructor(@inject('EmployeeRepository') private readonly employeeRepository: EmployeeRepository) {
        super(employeeRepository, () => new Employee())
    }

}
