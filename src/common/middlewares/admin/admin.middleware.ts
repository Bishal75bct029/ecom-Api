import { envConfig } from '@/configs/envConfig';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const [, token] = req.headers['authorization']?.split(' ') || [];

      if (!token) throw new UnauthorizedException('Unauthorized');

      const payload = await this.jwtService.verifyAsync<UserJwtPayload>(token, {
        secret: envConfig.ADMIN_JWT_SECRET,
        issuer: envConfig.ADMIN_JWT_ISSUER,
        audience: envConfig.ADMIN_JWT_AUDIENCE,
      });

      if (payload.role !== 'ADMIN') throw new UnauthorizedException('Unauthorized');
      req.currentUser = payload;

      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
