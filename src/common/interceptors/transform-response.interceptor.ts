import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

interface InterceptorResponse<T> {
  data: T;
  statusCode: number;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, InterceptorResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<InterceptorResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse<Response>().statusCode;
        return {
          statusCode,
          data,
        };
      }),
    );
  }
}
