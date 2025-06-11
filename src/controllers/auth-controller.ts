import { injectable, inject } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import { UserService } from "../bl";
import { AppResponse } from "../utility";
import { ExtendedRequest, ILoginRequest, ISignUpRequest, IResendCodeRequest, IForgotPasswordRequest, IResetPasswordRequest, IVerifyRequest } from "../models";
import { signUpSchema, resendCodeSchema, verifySchema, loginSchema, resetPasswordSchema, forgotPasswordSchema } from "../models/payload-schemas/index";
import { authorize } from "../middlewares";
import { payloadValidator, bodyValidator, queryValidator } from "../middlewares/payload-validator";

@injectable()
export class AuthController extends ControllerBase {
    constructor(
        @inject('UserService') private readonly userService: UserService,
    ) {
        super('/auth');
        this.endPoints = [
            {
                method: 'POST',
                path: 'login',
                middlewares: [bodyValidator(loginSchema)],
                handler: this.login as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: 'signup',
                middlewares: [bodyValidator(signUpSchema)],
                handler: this.signUp as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'profile',
                middlewares: [authorize as preHandlerHookHandler],
                handler: this.getCurrentProfile as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'logout',
                handler: this.logout as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'verify',
                middlewares: [queryValidator(verifySchema)],
                handler: this.verify as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'resend-code',
                middlewares: [queryValidator(resendCodeSchema)],
                handler: this.resendCode as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'forgot-password',
                middlewares: [queryValidator(forgotPasswordSchema)],
                handler: this.forgotPassword as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: 'reset-password',
                middlewares: [bodyValidator(resetPasswordSchema)],
                handler: this.resetPassword as RouteHandlerMethod
            }
        ];
    }

    private login = async (req: FastifyRequest<{Body: ILoginRequest}>, res: FastifyReply) => {
        let { token, ...rest} = await this.userService.login(req.body);
        res.setCookie('auth_token', token, {
            httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
            secure: true, // Only send the cookie over HTTPS in production
            maxAge: 60 * 60 * 24, // Cookie expiration time in seconds (e.g., 1 day)
            path: '/', // Cookie is accessible across the entire site
            sameSite: 'lax', // Prevent the cookie from being sent with cross-site requests
        });
        res.send(AppResponse.success('Login successful', rest));
    }

    private signUp = async (req: FastifyRequest<{Body: ISignUpRequest}>, res: FastifyReply) => {
        let {token, ...rest} = await this.userService.signUp(req.body);
        res.setCookie('auth_token', token, {
            httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
            secure: true, // Only send the cookie over HTTPS in production
            maxAge: 60 * 60 * 24, // Cookie expiration time in seconds (e.g., 1 day)
            path: '/', // Cookie is accessible across the entire site
            sameSite: 'lax', // Prevent the cookie from being sent with cross-site requests
        });
        res.send(AppResponse.success('Sign up successful', rest));
    }

    private getCurrentProfile = async (req: FastifyRequest, res: FastifyReply) => {
        let {user} = req as ExtendedRequest;

        if(user){
            let currentUser = await this.userService.getById(user.id, user);
            res.send(AppResponse.success('User profile retrieved successfully', currentUser));
        }else{
            res.status(404).send(AppResponse.error('User Not found'));
        }
    }

    private logout = async (req: FastifyRequest, res: FastifyReply) => {
        res.clearCookie('auth_token',{sameSite: 'lax', secure: true, httpOnly: true, path: '/'})
        res.send(AppResponse.success('Logged out successfully'));
        }

    private resendCode = async (req: FastifyRequest<{ Querystring: IResendCodeRequest }>, res: FastifyReply) => {
        let user = await this.userService.resendCode(req.query);
        res.send(AppResponse.success('Verification code resent successfully', user));
    }

    private verify = async (req: FastifyRequest<{ Querystring: IVerifyRequest }>, res: FastifyReply) => {
        let verification = await this.userService.verify(req.query);
        res.send(AppResponse.success('Verification code verified successfully', verification));
    }

    private forgotPassword = async (req: FastifyRequest<{ Querystring: IForgotPasswordRequest }>, res: FastifyReply) => {
        let user = await this.userService.forgotPassword(req.query);
        res.send(AppResponse.success('Password reset code sent successfully', user));
    }

    private resetPassword = async (req: FastifyRequest<{ Body: IResetPasswordRequest }>, res: FastifyReply) => {
        let user = await this.userService.resetPassword(req.body);
        res.clearCookie('auth_token', { sameSite: 'lax', secure: true, httpOnly: true, path: '/' });
        res.send(AppResponse.success('Password reset successfully', user));
    }
}