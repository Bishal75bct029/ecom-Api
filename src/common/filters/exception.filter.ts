import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter<unknown> {
  constructor(private readonly logger: Logger) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseData =
      exception instanceof HttpException && exception.getResponse()
        ? {
            ...(exception.getResponse() as Error),
            statusCode: status,
          }
        : {
            message: (exception as Error).message,
            error: (exception as Error).name,
            statusCode: status,
          };
    this.logger.error(responseData.message ? responseData.message : null);
    response.status(status).json(responseData);
  }
}
