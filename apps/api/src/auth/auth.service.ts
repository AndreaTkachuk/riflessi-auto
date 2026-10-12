import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { Role } from '../generated/prisma/client.js';

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('Email già registrata');
    }
    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: { email, passwordHash, name: dto.name },
      select: publicUserSelect,
    });
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    const ok = user
      ? await argon2.verify(user.passwordHash, dto.password)
      : false;
    if (!user || !ok) {
      throw new UnauthorizedException('Credenziali non valide');
    }
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  signToken(user: { id: string; role: string }) {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return this.jwt.signAsync(payload);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }
  }

  findPublicUser(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }
}
