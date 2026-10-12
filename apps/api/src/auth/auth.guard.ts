import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Role } from '../generated/prisma/client.js';
import { AUTH_COOKIE } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { IS_PUBLIC_KEY } from './decorators/public.decorator.js';
import { ROLES_KEY } from './decorators/roles.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const targets = [ctx.getHandler(), ctx.getClass()];
    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets) ??
      false;
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      targets,
    );

    const req = ctx.switchToHttp().getRequest<Request>();
    const user = await this.resolveUser(req);

    if (!user) {
      if (isPublic) return true;
      throw new UnauthorizedException(); // 401
    }
    req.user = user;

    if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(); // 403
    }
    return true;
  }

  private async resolveUser(req: Request) {
    const token = req.cookies?.[AUTH_COOKIE];
    if (!token) return null;
    try {
      const payload = await this.auth.verifyToken(token);
      return await this.auth.findPublicUser(payload.sub);
    } catch {
      return null;
    }
  }
}
