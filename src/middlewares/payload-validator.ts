import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { ZodSchema } from 'zod';
import { ActivityLog } from "../entities";
import { ExtendedRequest } from '../models';
import { AppError } from '../utility/app-error';

export const payloadValidator = (zodSchema: ZodSchema): preHandlerHookHandler => {
  return async (req: FastifyRequest, res: FastifyReply) => {
    const parsed = await zodSchema.safeParseAsync(req.body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      const request = req as ExtendedRequest;
      if (request.activityLog) {
        await request.activityLog.logEnd('error', JSON.stringify({
          code: 400,
          message: 'Bad Request',
          errors
        }));
        request.activityLog = undefined;
      }

      // ✅ throw AppError with errors array
      throw new AppError('Bad Request', '400', errors);
    }
  };
};