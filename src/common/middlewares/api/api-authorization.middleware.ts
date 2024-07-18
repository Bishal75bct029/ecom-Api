import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Response } from 'express';

@Injectable()
export class ApiAuthorizationMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
