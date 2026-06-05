import { HttpStatus } from '../../constants/http-status.constant.ts';
import { AppError } from './app.error.ts';

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(HttpStatus.BAD_REQUEST, message);
  }
}
