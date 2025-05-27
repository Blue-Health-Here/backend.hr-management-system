import { inject, injectable } from "tsyringe";
import { DesignationRepository } from "../dal";
import { Designation } from "../entities";
import { IDesignationRequest, IDesignationResponse } from "../models";
import { Service } from "./generics/service";

@injectable()
export class DesignationService extends Service<Designation, IDesignationResponse, IDesignationRequest> {
    constructor(@inject('DesignationRepository') private readonly designationRepository: DesignationRepository) {
        super(designationRepository, () => new Designation())
    }

}
