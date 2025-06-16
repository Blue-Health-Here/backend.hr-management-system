import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import cors from '@fastify/cors'
import {container} from 'tsyringe'
import { registerRepositories } from "../dal/register/repositories-register";
import { registerServices } from "../bl/register/services-register";
import { logger } from "../middlewares";
import { ExtendedRequest } from "../models";
import { ActivityLog } from "../entities";
import { registerControllers } from "../controllers/register/controllers-register";
import { AppResponse } from "./app-response"; 

export const fastifyRegisters = async (fastify: FastifyInstance) => {
    fastify.register(cors, {
        origin: (origin, callback) => {
            callback(null, true);
        }, // Allow all origins
    });
    registerRepositories(container);
    registerServices(container);
    fastify.addHook('onResponse', async (req: FastifyRequest, res: FastifyReply) => {
        const request = req as ExtendedRequest;
        if(request.activityLog) {
            await request.activityLog?.logEnd('success');
        };
    });
    fastify.setNotFoundHandler(async (req, reply) => {
        const request = req as ExtendedRequest;
        request.activityLog = new ActivityLog().logStart(request.url, request.method, request);
        if(request.activityLog) await request.activityLog.logEnd('error', JSON.stringify({code: 404, message: 'Route not found'}));
        request.activityLog = undefined;
        reply.status(404).send(AppResponse.error(`Route: ${request.originalUrl} not found`, '404'));
    });

    const controllers = registerControllers(container)
    await fastify.register((fi: FastifyInstance, options: FastifyPluginOptions, done) => {
        fi.addHook('onRequest', logger as preHandlerHookHandler)
        Object.values(controllers).forEach((controller) => {
            controller.getRouter(fi);
        })
        done();
    }, {prefix: '/api'});
}