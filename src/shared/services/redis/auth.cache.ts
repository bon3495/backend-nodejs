import type Logger from 'bunyan';
import type { SetOptions } from 'redis';

import { config } from '@/root/config';
import { ServerError } from '@/root/errorsHandler';
import { GLOBAL } from '@/global/constant';
import { BaseCache } from '@/services/redis/base.cache';

const log: Logger = config.createLogger(GLOBAL.AUTH_CACHE);

export class AuthCache extends BaseCache {
  constructor() {
    super(GLOBAL.AUTH_CACHE);
  }

  public async getRefreshTokenFromCache(
    userId: string
  ): Promise<string | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const existingToken = await this.client.GET(`refresh_token:${userId}`);

      return existingToken;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async saveRefreshTokenToCache({
    token,
    userId,
    options,
  }: {
    token: string;
    userId: string;
    options?: SetOptions;
  }): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.SET(`refresh_token:${userId}`, token, options);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removeRefreshTokenFromCache(userId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.DEL(`refresh_token:${userId}`);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
