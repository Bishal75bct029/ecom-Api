import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

export interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    export interface Request {
      currentUser?: JwtPayload;
    }
  }
}

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const token: string = req.cookies['x-auth-cookie'];

      if (!token) throw new UnauthorizedException('Unauthorized');

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (payload.role !== 'ADMIN') throw new UnauthorizedException('Unauthorized');
      req.currentUser = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
