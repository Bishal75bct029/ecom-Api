import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  constructor() {}
  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      if (!req.session.user) throw new UnauthorizedException('Unauthorized');
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
