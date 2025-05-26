import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { ZodSchema } from 'zod';
import { ActivityLog } from "../entities";
import { ExtendedRequest } from '../models';
import { AppError } from '../utility/app-error';

type ValidationType = 'body' | 'query' | 'params';

interface ValidationConfig {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

// Enhanced validator that can handle body, query, and params
export const payloadValidator = (config: ValidationConfig | ZodSchema): preHandlerHookHandler => {
  return async (req: FastifyRequest, res: FastifyReply) => {
    let validationConfig: ValidationConfig;
    
    // Handle backward compatibility - if ZodSchema is passed directly, treat as body validation
    if ('_def' in config) {
      validationConfig = { body: config as ZodSchema };
    } else {
      validationConfig = config as ValidationConfig;
    }

    const errors: Array<{ field: string; message: string; type: ValidationType }> = [];

    // Validate body
    if (validationConfig.body) {
      const parsed = await validationConfig.body.safeParseAsync(req.body);
      if (!parsed.success) {
        const bodyErrors = parsed.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          type: 'body' as ValidationType
        }));
        errors.push(...bodyErrors);
      }
    }

    // Validate query parameters
    if (validationConfig.query) {
      const parsed = await validationConfig.query.safeParseAsync(req.query);
      if (!parsed.success) {
        const queryErrors = parsed.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          type: 'query' as ValidationType
        }));
        errors.push(...queryErrors);
      }
    }

    // Validate route parameters
    if (validationConfig.params) {
      const parsed = await validationConfig.params.safeParseAsync(req.params);
      if (!parsed.success) {
        const paramErrors = parsed.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          type: 'params' as ValidationType
        }));
        errors.push(...paramErrors);
      }
    }

    // If there are any validation errors, handle them
    if (errors.length > 0) {
      const request = req as ExtendedRequest;
      if (request.activityLog) {
        await request.activityLog.logEnd('error', JSON.stringify({
          code: 400,
          message: 'Bad Request',
          errors
        }));
        request.activityLog = undefined;
      }

      throw new AppError('Bad Request', '400', errors);
    }
  };
};

// Convenience functions for single-type validation
export const bodyValidator = (zodSchema: ZodSchema): preHandlerHookHandler => {
  return payloadValidator({ body: zodSchema });
};

export const queryValidator = (zodSchema: ZodSchema): preHandlerHookHandler => {
  return payloadValidator({ query: zodSchema });
};

export const paramsValidator = (zodSchema: ZodSchema): preHandlerHookHandler => {
  return payloadValidator({ params: zodSchema });
};