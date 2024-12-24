import { AuthorizationMiddleware } from './authorization.middleware';

describe('AuthorizationMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthorizationMiddleware()).toBeDefined();
  });
});
