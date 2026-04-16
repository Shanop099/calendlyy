import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(`[ERROR] ${req.method} ${req.path}`, err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = err as Prisma.PrismaClientKnownRequestError;

    if (prismaError.code === 'P2002') {
      return res.status(409).json({ error: 'A record with this value already exists.' });
    }
    if (prismaError.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found.' });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ error: 'Invalid data provided to the database.' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}