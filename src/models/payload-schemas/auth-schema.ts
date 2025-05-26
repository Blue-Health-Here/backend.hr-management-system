import z, { date } from "zod";

export const signUpSchema = z.object({
    userName: z.string().min(2).max(20),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8).max(100),
    firstName: z.string().min(2).max(100),
    middleName: z.string().optional(),
    lastName: z.string().min(2).max(100),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
    temporaryAddress: z.string().optional(),
    dateOfBirth: z.string().optional(),

});
export const loginSchema = z.object({
    userName: z.string().min(2).max(100),
    password: z.string().min(8).max(100),
});

export const verifyAccountSchema = z.object({
    userId: z.string().email("Invalid email format"),
    code: z.string().min(6).max(6),
});

export const resendCodeSchema = z.object({
    email: z.string().email("Invalid email format"),
    type: z.enum(['accountVerify', 'forgotPassword']),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format")
});

export const resetPasswordSchema = z.object({
    userId: z.string(),
    code: z.string().min(6).max(6),
    newPassword: z.string().min(8).max(100),
});
    