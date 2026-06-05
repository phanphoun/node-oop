import { HttpStatus } from '../../constants/http-status.constant.ts';
import { AppError } from './app.error.ts';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(HttpStatus.NOT_FOUND, message);
  }
}
