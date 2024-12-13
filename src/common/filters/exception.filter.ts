import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

type ApiErrorResponse = {
  statusCode: HttpStatus;
  error: string;
  message: string;
};

@Catch()
export class AllExceptionFilter implements ExceptionFilter<unknown> {
  constructor(private readonly logger: Logger) {}
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseData: ApiErrorResponse = {
      statusCode: status,
      error: (error as Error).name,
      message: (error as Error).message || 'Something went wrong.',
    };

    if (error instanceof HttpException && error.getResponse()) {
      responseData = {
        ...responseData,
        ...(error.getResponse() as Error),
      };
    } else if (error instanceof QueryFailedError && 'code' in error) {
      switch (error.code) {
        case '23505': {
          const key = 'detail' in error && typeof error.detail === 'string' ? error.detail.match(/\((.*?)\)/)?.[1] : '';
          responseData.statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
          responseData.message = `Duplicate ${key + ' ' || ''}entry found.`;
          break;
        }
        default:
          responseData.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
      }
    }
    this.logger.error(responseData.message ? responseData.message : null);
    response.status(responseData.statusCode).json(responseData);
  }
}
