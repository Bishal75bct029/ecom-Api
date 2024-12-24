import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { sanitizeRequestBody } from '@/common/utils';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      if (!req.session?.user) throw new UnauthorizedException('Unauthorized.');
      req.body = sanitizeRequestBody(req.body);
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
