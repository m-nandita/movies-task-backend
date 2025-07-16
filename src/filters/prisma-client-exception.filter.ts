import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ErrorResponse } from './error-response-format';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred.';
    const error = 'InvalidQueryExecution';

    if (exception.meta) {
      if (exception.meta.target) {
        const uniqueFields = (exception.meta.target as string[])?.join(', ');
        message = `Following field(s) must be unique: ${uniqueFields}`;
        statusCode = HttpStatus.CONFLICT;
      } else if (exception.meta.field_name) {
        message = `Invalid value provided for field: ${exception.meta.field_name}`;
        statusCode = HttpStatus.BAD_REQUEST;
      } else if (exception.meta.cause) {
        message = `Database constraint violation: ${exception.meta.cause}`;
        statusCode = HttpStatus.BAD_REQUEST;
      }
    } else {
      switch (exception.code) {
        case 'P1000':
          message =
            'Unable to connect with database. Check your credentials and try again.';
          statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          break;
        case 'P1001':
          message =
            'Unable to connect with database. Please ensure that the database is running.';
          statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          break;
        case 'P2025':
          message = 'You are referencing a record that does not exist.';
          statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
          break;
        case 'P2003':
          message = 'You are trying to connect a record that does not exist.';
          statusCode = HttpStatus.NOT_ACCEPTABLE;
          break;
        default:
          message = `An unexpected error occurred: ${exception.message}`;
          break;
      }
    }

    const errorResponse: ErrorResponse<string> = {
      status: statusCode,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(errorResponse);
  }
}
