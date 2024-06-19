import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log('api');
    next();
  }
}
