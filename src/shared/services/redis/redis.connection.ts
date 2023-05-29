import Logger from 'bunyan';

import { config } from '@/root/config';
import { GLOBAL } from '@/global/constant';
import { BaseCache } from '@/services/redis/base.cache';

const log: Logger = config.createLogger(GLOBAL.REDIS_CONNECTION);

class RedisConnection extends BaseCache {
  constructor() {
    super(GLOBAL.REDIS_CONNECTION);
  }

  async connect() {
    try {
      await this.client.connect();
      log.info(`Redis connection: ${await this.client.ping()}`);
    } catch (error) {
      log.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
