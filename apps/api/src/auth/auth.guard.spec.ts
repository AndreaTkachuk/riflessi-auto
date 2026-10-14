import {
  type ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { CurrentUser } from '@riflessi/shared';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';

// Fake controllers: the guard reads the metadata set by the real decorators.
class PrivateController {
  handler() {}
}

@Public()
class PublicController {
  handler() {}
}

@Roles('ADMIN', 'EDITOR')
class AdminController {
  handler() {}
}

function contextFor(
  controller: new () => { handler: () => void },
  req: Partial<Request>,
) {
  return {
    getHandler: () => controller.prototype.handler,
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

const user = (role: CurrentUser['role']): CurrentUser => ({
  id: 'u1',
  email: 'test@test.it',
  name: null,
  role,
});

describe('AuthGuard', () => {
  let guard: AuthGuard;
  // Only the two methods the guard uses; vi.fn() records calls and lets each test choose the result.
  const auth = {
    verifyToken: vi.fn(),
    findPublicUser: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    // Like Angular TestBed: real AuthGuard and Reflector, AuthService replaced by the mock.
    const moduleRef = await Test.createTestingModule({
      providers: [AuthGuard, { provide: AuthService, useValue: auth }],
    }).compile();
    guard = moduleRef.get(AuthGuard);
  });

  function loggedInAs(role: CurrentUser['role']) {
    auth.verifyToken.mockResolvedValue({ sub: 'u1', role });
    auth.findPublicUser.mockResolvedValue(user(role));
    return { cookies: { access_token: 'valid-token' } };
  }

  it('rejects a private route without cookie (401)', async () => {
    await expect(
      guard.canActivate(contextFor(PrivateController, { cookies: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(auth.verifyToken).not.toHaveBeenCalled();
  });

  it('rejects an invalid token (401)', async () => {
    auth.verifyToken.mockRejectedValue(new UnauthorizedException());
    await expect(
      guard.canActivate(
        contextFor(PrivateController, { cookies: { access_token: 'bad' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a valid token of a deleted user (401)', async () => {
    auth.verifyToken.mockResolvedValue({ sub: 'gone', role: 'USER' });
    auth.findPublicUser.mockResolvedValue(null);
    await expect(
      guard.canActivate(
        contextFor(PrivateController, { cookies: { access_token: 'ok' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows a private route and attaches req.user', async () => {
    const req: Partial<Request> = loggedInAs('USER');
    await expect(
      guard.canActivate(contextFor(PrivateController, req)),
    ).resolves.toBe(true);
    expect(req.user).toEqual(user('USER'));
  });

  it('allows a public route without cookie', async () => {
    const req: Partial<Request> = { cookies: {} };
    await expect(
      guard.canActivate(contextFor(PublicController, req)),
    ).resolves.toBe(true);
    expect(req.user).toBeUndefined();
  });

  it('attaches req.user on a public route when logged in', async () => {
    const req: Partial<Request> = loggedInAs('USER');
    await guard.canActivate(contextFor(PublicController, req));
    expect(req.user?.role).toBe('USER');
  });

  it('rejects a role not listed in @Roles (403)', async () => {
    await expect(
      guard.canActivate(contextFor(AdminController, loggedInAs('USER'))),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a role listed in @Roles', async () => {
    await expect(
      guard.canActivate(contextFor(AdminController, loggedInAs('EDITOR'))),
    ).resolves.toBe(true);
  });

  it('reads the role from the DB, not from the token', async () => {
    // Token still says ADMIN, but the user was downgraded in the DB.
    auth.verifyToken.mockResolvedValue({ sub: 'u1', role: 'ADMIN' });
    auth.findPublicUser.mockResolvedValue(user('USER'));
    await expect(
      guard.canActivate(
        contextFor(AdminController, { cookies: { access_token: 'old' } }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
