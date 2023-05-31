import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { NotFoundError } from '@/root/errorsHandler';
import { userService } from '@/services/db/user.service';
import { UserCache } from '@/services/redis/user.cache';

const userCache: UserCache = new UserCache();

export class CurrentUser {
  public async getUser(req: Request, res: Response): Promise<void> {
    let accessToken = null;
    let user = null;

    if (!req.currentUser?.userId) {
      throw new NotFoundError('User not found. Try again!');
    }

    const cachedUser = await userCache.getUserFromCache(req.currentUser.userId);

    const existingUser = cachedUser
      ? cachedUser
      : await userService.getUserById(req.currentUser.userId);

    if (Object.keys(existingUser).length > 0) {
      accessToken = req.headers.authorization?.split(' ')[1];
      user = existingUser;
    }

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      token: {
        accessToken,
      },
      data: {
        user,
      },
    });
  }
}
