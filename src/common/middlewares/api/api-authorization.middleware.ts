import { ForbiddenException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';

@Injectable()
export class ApiAuthorizationMiddleware implements NestMiddleware {
  async use({ currentUser }: Request, _res: Response, next: NextFunction) {
    try {
      if (!currentUser.id || !currentUser.role) throw new ForbiddenException('Not Allowed.');
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
