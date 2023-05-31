import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { AuthCache } from '@/services/redis/auth.cache';

const authCache: AuthCache = new AuthCache();
export class LogOut {
  public async update(req: Request, res: Response): Promise<void> {
    req.session = null;

    await authCache.removeRefreshTokenFromCache(req.currentUser!.userId);

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'Log out successfully',
      token: '',
      data: null,
    });
  }
}
