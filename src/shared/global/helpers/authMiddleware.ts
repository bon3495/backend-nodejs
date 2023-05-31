import type { NextFunction, Request, Response } from 'express';
import JWT, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { config } from '@/root/config';
import { NotAuthorizedError } from '@/root/errorsHandler';
import { AuthCache } from '@/services/redis/auth.cache';
import { TAuthValidate } from '@/auth/schemas/auth.validate';
import { IAuthPayload } from '@/auth/types';

const authCache = new AuthCache();

export class AuthMiddleware {
  public verifyUser(req: Request, _: Response, next: NextFunction): void {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new NotAuthorizedError(
        'Token is not available. Please login again!'
      );
    }

    try {
      const payload: IAuthPayload = JWT.verify(
        token,
        config.JWT_TOKEN!
      ) as IAuthPayload;

      req.currentUser = payload;

      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new NotAuthorizedError('Token is expired!');
      }
      throw new NotAuthorizedError('Token is not valid. Please login again!');
    }
  }

  public checkAuthentication(
    req: Request,
    _: Response,
    next: NextFunction
  ): void {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new NotAuthorizedError(
        'Authentication is required to access this route!'
      );
    }
    next();
  }

  public async verifyRefreshToken(
    req: Request,
    _: Response,
    next: NextFunction
  ): Promise<void> {
    const { refreshToken }: TAuthValidate = req.body;

    if (!refreshToken) {
      throw new NotAuthorizedError(
        'Token is not available. Please login again!'
      );
    }

    const payload = JWT.verify(
      refreshToken,
      config.JWT_TOKEN_REFRESH!
    ) as IAuthPayload;

    const existingRefreshToken = await authCache.getRefreshTokenFromCache(
      payload.userId
    );

    if (!existingRefreshToken) {
      throw new NotAuthorizedError(
        'Token is not available. Please login again!'
      );
    }

    if (existingRefreshToken !== refreshToken) {
      throw new NotAuthorizedError('Refreshing new access token failed');
    }

    try {
      req.currentUser = payload;
      next();
    } catch (error) {
      if (error) {
        if (error instanceof JsonWebTokenError) {
          throw new NotAuthorizedError('Invalid token');
        }
      }
    }
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
