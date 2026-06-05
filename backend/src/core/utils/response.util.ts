import type { Response } from 'express';

export const success = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message = 'OK',
) => res.status(statusCode).json({ success: true, message, data });

export const noContent = (res: Response) => res.status(204).send();
