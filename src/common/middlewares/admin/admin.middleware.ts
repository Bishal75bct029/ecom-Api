import { sanitizeRequestBody } from '@/common/utils';
import { envConfig } from '@/configs/envConfig';
import { PasetoJwtService } from '@/libs/pasetoJwt/pasetoJwt.service';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    export interface Request {
      currentUser?: UserJwtPayload;
    }
  }
}

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: PasetoJwtService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      console.log(req.originalUrl, req.method);
      const [, token] = req.headers['authorization']?.split(' ') || [];

      if (!token) throw new UnauthorizedException('Unauthorized');

      const payload = await this.jwtService.pasetoVerify<UserJwtPayload>(token, {
        secret: envConfig.ADMIN_JWT_SECRET,
        issuer: envConfig.ADMIN_JWT_ISSUER,
        audience: envConfig.ADMIN_JWT_AUDIENCE,
      });

      if (payload.role !== 'ADMIN') throw new UnauthorizedException('Unauthorized');
      req.currentUser = payload;
      req.body = sanitizeRequestBody(req.body);
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
