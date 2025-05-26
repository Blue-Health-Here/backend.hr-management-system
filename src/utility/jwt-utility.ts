import { sign, verify, SignOptions } from "jsonwebtoken";
import { ITokenUser } from "../models";

export const signJwt = (user: ITokenUser, tokenSecret: string | null = null, expiryTime?: {unit: 'Hours' | 'Days' | 'Months' | 'Seconds' | 'Minutes', amount: number}): string => {        
    return sign(user, tokenSecret ?? (process.env.TOKEN_SECRET_KEY ?? '') , { expiresIn: expiryTime ? `${expiryTime.amount} ${expiryTime.unit}` : '10 days' } as SignOptions);
}

export const verifyJwt = (jwt: string, tokenSecret: string | null = null, ignoreExpiration: boolean = false): boolean => {
    let user = verify(jwt, tokenSecret ?? (process.env.TOKEN_SECRET_KEY ?? ''), );
    if (!user) return false;
    return true;
}