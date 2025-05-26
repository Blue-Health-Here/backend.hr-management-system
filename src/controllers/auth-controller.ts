import { injectable, inject } from "tsyringe";
import { ControllerBase } from "./generics/controller-base";
import { FastifyReply, FastifyRequest, preHandlerHookHandler, RouteHandlerMethod } from "fastify";
import {  UserService } from "../bl";
import { ExtendedRequest, ILoginRequest, ISignUpRequest, IResendCodeRequest, IForgotPasswordRequest, IResetPasswordRequest, IVerifyAccountRequest } from "../models";
import { signUpSchema, resendCodeSchema, verifyAccountSchema, loginSchema, resetPasswordSchema, forgotPasswordSchema } from "../models/payload-schemas/index";
import { authorize, payloadValidator } from "../middlewares";


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
                middlewares: [payloadValidator(loginSchema)],
                handler: this.login as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: 'signup',
                middlewares: [payloadValidator(signUpSchema)],
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
                path: 'account-verify',
                // middlewares: [payloadValidator(verifyAccountSchema)],
                handler: this.verifyAccount as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'resend-code',
                // middlewares: [payloadValidator(resendCodeSchema)],
                handler: this.resendCode as RouteHandlerMethod
            },
            {
                method: 'GET',
                path: 'forgot-password',
                // middlewares: [payloadValidator(forgotPasswordSchema)],
                handler: this.forgotPassword as RouteHandlerMethod
            },
            {
                method: 'POST',
                path: 'reset-password',
                middlewares: [payloadValidator(resetPasswordSchema)],
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
        res.send(rest);
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
        res.send(rest);
    }

    private getCurrentProfile = async (req: FastifyRequest, res: FastifyReply) => {
        let {user} = req as ExtendedRequest;

        if(user){
            let currentUser = await this.userService.getById(user.id, user);
            res.send(currentUser);
        }else{
            res.status(404).send({message: 'User Not found'})
        }
    }

    private logout = async (req: FastifyRequest, res: FastifyReply) => {

        res.clearCookie('auth_token',{sameSite: 'lax', secure: true, httpOnly: true, path: '/'})
            res.send({message: 'Logged out successfully'});
    }

    private resendCode = async (req: FastifyRequest<{ Querystring: IResendCodeRequest }>, res: FastifyReply) => {
        let user  = await this.userService.resendCode(req.query);
        res.send(user);
    }

    private verifyAccount = async (req: FastifyRequest<{ Querystring: IVerifyAccountRequest }>, res: FastifyReply) => {
        let currentUser = await this.userService.verifyAccount(req.query);
        res.send(currentUser);
    }

    private forgotPassword = async (req: FastifyRequest<{ Querystring: IForgotPasswordRequest }>, res: FastifyReply) => {
        let user = await this.userService.forgotPassword(req.query);
        res.send(user);
    }

    private resetPassword = async (req: FastifyRequest<{ Body: IResetPasswordRequest }>, res: FastifyReply) => {
        let user = await this.userService.resetPassword(req.body);
        res.send(user);
    }
}