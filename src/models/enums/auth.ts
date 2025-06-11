
export const verificationTypes = {
    AccountVerify: 'accountVerify',
    ForgotPassword: 'forgotPassword'
} as const;
// Extract the values for TypeORM and Zod
export const verificationTypeValues = Object.values(verificationTypes) as [string, ...string[]];


export const verificationMethods = ['email', 'phone'] as const;