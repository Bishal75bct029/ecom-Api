import { envConfig } from '@/configs/envConfig';
import { PasetoJwtService } from '@/libs/pasetoJwt/pasetoJwt.service';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: PasetoJwtService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const [, token] = req.headers['authorization']?.split(' ') || [];

      if (token) {
        const payload = await this.jwtService.pasetoVerify<UserJwtPayload>(token, {
          secret: envConfig.API_JWT_SECRET,
          issuer: envConfig.API_JWT_ISSUER,
          audience: envConfig.API_JWT_AUDIENCE,
        });
        req.currentUser = payload;
      } else {
        req.currentUser = {};
      }
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
