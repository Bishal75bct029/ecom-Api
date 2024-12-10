import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'node:fs';

@Controller()
export class AppController {
  @Get('/health')
  health(): string {
    return 'Namaste';
  }

  @Get('/update')
  update() {
    const routes = JSON.parse(readFileSync('./dist/routes.json', 'utf8')) as { path: string; method: string }[];

    const permissions = routes.map((route) => ({
      path: route.path,
      method: route.method,
      allowedRoles: (() => {
        if (route.path.startsWith('/admin')) {
          return ['ADMIN', 'SUPERADMIN'];
        }
        if (route.path.startsWith('/api')) {
          return ['USER'];
        }
        return [];
      })(),
    }));
    console.log(permissions);

    return permissions;
  }
}
