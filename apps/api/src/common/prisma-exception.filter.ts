import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

const ERRORS: Record<string, [number, string]> = {
  P2002: [409, 'Esiste già un elemento con questo valore'],
  P2003: [409, 'Elemento collegato ad altri dati: elimina prima quelli'],
  P2025: [404, 'Elemento non trovato'],
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const known = ERRORS[error.code];
    if (!known) {
      this.logger.error(error);
    }
    const [statusCode, message] = known ?? [500, 'Errore del database'];
    res.status(statusCode).json({ statusCode, message });
  }
}
