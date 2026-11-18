import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isCorsError = err.message === 'Origin not allowed by CORS policy';
  const statusCode = isCorsError ? 403 : err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Never leak internal server error messages or stack traces in production
  const safeMessage =
    statusCode >= 500 && isProd
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  console.error(`[Error ${statusCode}]: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      message: safeMessage,
      ...(!isProd && { stack: err.stack, details: err.details }),
    },
  });
};
