import Logger from 'bunyan';

import { config } from '@/root/config';
import { ServerError } from '@/root/errorsHandler';
import { BaseCache } from '@/services/redis/base.cache';
import { IUserDocument } from '@/users/types';

interface IUserCacheInput {
  key: string;
  createdUser: IUserDocument;
}

const log: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache({
    key,
    createdUser,
  }: IUserCacheInput): Promise<void> {
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      work,
      location,
      school,
      quote,
      bgImageVersion,
      bgImageId,
      social,
      notifications,
      createdAt,
    } = createdUser;

    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      blocked: `${JSON.stringify(blocked)}`,
      blockedBy: `${JSON.stringify(blockedBy)}`,
      postsCount: `${postsCount}`,
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`,
      social: `${JSON.stringify(social)}`,
      notifications: `${JSON.stringify(notifications)}`,
      createdAt: `${createdAt}`,
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      this.client.ZADD('users', { score: Number(uId), value: key });

      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, itemKey, itemValue);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
