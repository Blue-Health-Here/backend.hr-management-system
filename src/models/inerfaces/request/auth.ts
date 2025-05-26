
export interface IResendCodeRequest {
    email: string;
    whichPurpose: string;
}

export interface ILoginRequest {
    userName: string;
    password: string;
}

export interface IForgotPasswordRequest {
    email: string;
}

export interface IResetPasswordRequest {
    userId: string;
    code: string;
    newPassword: string;
}

export interface IVerifyAccountRequest {
    userId: string;
    code: string;
    whichPurpose: string;
}
