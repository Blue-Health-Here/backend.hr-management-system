// models/country-response.interface.ts

import { IResponseBase } from "./response-base";

export interface ICountryResponse extends IResponseBase {
    name: string;
    code: string;
    iso2: string;
    capital?: string;
    continent?: string;
    currency?: string;
    phone?: string;
}