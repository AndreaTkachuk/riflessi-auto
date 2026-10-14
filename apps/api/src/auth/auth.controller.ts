import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, type PublicUser } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

export const AUTH_COOKIE = 'access_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.register(dto);
    await this.setCookie(res, user);
    return user;
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.login(dto);
    await this.setCookie(res, user);
    return user;
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE, { path: '/' });
  }

  // The global AuthGuard has already verified the cookie and loaded the user.
  @Get('me')
  me(@CurrentUser() user: PublicUser) {
    return user;
  }

  private async setCookie(res: Response, user: { id: string; role: string }) {
    const token = await this.auth.signToken(user);
    res.cookie(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SEVEN_DAYS_MS,
      path: '/',
    });
  }
}
