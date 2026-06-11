import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app.error.js';

export type AppErrorResponse = {
  success: false;
  message: string;
  code?: string;
};

const toAppError = (err: AppError): AppErrorResponse => ({
  success: false,
  message: err.message,
  code: err.code,
});

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const body = toAppError(err);
    res.status(err.statusCode).json(body);
    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  } satisfies AppErrorResponse);
};
