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

// Helper function to validate a single field type
const validateField = async (
  schema: ZodSchema, 
  data: any, 
  type: ValidationType
): Promise<Array<{ field: string; message: string; type: ValidationType }>> => {
  const parsed = await schema.safeParseAsync(data);
  
  if (!parsed.success) {
    return parsed.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      type
    }));
  }
  
  return [];
};

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

    // Collect all validation promises
    const validationPromises: Promise<Array<{ field: string; message: string; type: ValidationType }>>[] = [];

    if (validationConfig.body) {
      validationPromises.push(validateField(validationConfig.body, req.body, 'body'));
    }

    if (validationConfig.query) {
      validationPromises.push(validateField(validationConfig.query, req.query, 'query'));
    }

    if (validationConfig.params) {
      validationPromises.push(validateField(validationConfig.params, req.params, 'params'));
    }

    // Execute all validations concurrently
    const validationResults = await Promise.all(validationPromises);
    const errors = validationResults.flat();

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
export const bodyValidator = (zodSchema: ZodSchema): preHandlerHookHandler => 
  payloadValidator({ body: zodSchema });

export const queryValidator = (zodSchema: ZodSchema): preHandlerHookHandler => 
  payloadValidator({ query: zodSchema });

export const paramsValidator = (zodSchema: ZodSchema): preHandlerHookHandler => 
  payloadValidator({ params: zodSchema });