import { FastifyReply, FastifyError, FastifyRequest } from "fastify";
import { ExtendedRequest } from "../models";
import { log, error } from "console";
import { QueryFailedError } from "typeorm";
import { parseDbError } from "../utility/db-error";
import { AppResponse } from "../utility/app-response";

export const errorHandler = async (
  err: FastifyError,
  req: ExtendedRequest | FastifyRequest,
  reply: FastifyReply
) => {
  const request = req as ExtendedRequest;

  let statusCode = typeof err.code === 'string' ? parseInt(err.code) : 500;
  let message = err.message || 'Internal Server Error';
  let errors = (err as any)?.errors;

  if (err instanceof QueryFailedError) {
    const parsed = parseDbError(err);
    statusCode = parsed.statusCode;
    message = parsed.message;
  }

  if (request.activityLog) {
    await request.activityLog.logEnd('error', JSON.stringify({
      code: statusCode,
      message,
      errors,
      stack: err.stack
    }));
    request.activityLog = undefined;
  }

  error('❌ Global Error:', err);

  reply.status(statusCode).send(
    AppResponse.error(
      message,
      process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      errors
    )
  );
};
