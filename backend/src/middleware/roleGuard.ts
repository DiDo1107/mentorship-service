import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import { AppError } from './errorHandler';

export function roleGuard(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Требуется авторизация', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Недостаточно прав доступа', 403));
    }

    next();
  };
}
