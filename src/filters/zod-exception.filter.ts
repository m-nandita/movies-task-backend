import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ErrorResponse } from './error-response-format';
import { ZodError } from 'zod';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const errorMessages = exception.issues.reduce(
      (acc, err) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      },
      {} as Record<string, string>,
    );

    const errorResponse: ErrorResponse<Record<string, string>> = {
      status: HttpStatus.BAD_REQUEST,
      error: 'ValidationException',
      message: errorMessages,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(errorResponse.status).json(errorResponse);
  }
}
