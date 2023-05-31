import Logger from 'bunyan';

import { config } from '@/root/config';
import { ServerError } from '@/root/errorsHandler';
import { GLOBAL } from '@/global/constant';
import { Helpers } from '@/global/helpers/utils';
import { BaseCache } from '@/services/redis/base.cache';
import { IUserDocument } from '@/users/types';

interface IUserCacheInput {
  key: string;
  createdUser: IUserDocument;
  userUid: string;
}

const log: Logger = config.createLogger(GLOBAL.USER_CACHE);

export class UserCache extends BaseCache {
  constructor() {
    super(GLOBAL.USER_CACHE);
  }

  public async saveUserToCache({
    key,
    createdUser,
    userUid,
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
      this.client.ZADD('users', { score: Number(userUid), value: key });

      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, itemKey, itemValue);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument> {
    try {
      if (!this.client.isOpen) {
        this.client.connect();
      }

      const userResponse = (await this.client.HGETALL(
        `users:${userId}`
      )) as Record<keyof IUserDocument, string>;

      return {
        _id: userResponse._id,
        authId: userResponse.authId,
        username: userResponse.username,
        email: userResponse.email,
        avatarColor: userResponse.avatarColor,
        uId: userResponse.uId,
        postsCount: Helpers.parseJSON<number>(userResponse.postsCount),
        work: userResponse.work,
        school: userResponse.school,
        quote: userResponse.quote,
        location: userResponse.location,
        blocked: Helpers.parseJSON(userResponse.blocked),
        blockedBy: Helpers.parseJSON(userResponse.blockedBy),
        followersCount: Helpers.parseJSON(userResponse.followersCount),
        followingCount: Helpers.parseJSON(userResponse.followingCount),
        notifications: Helpers.parseJSON(userResponse.notifications),
        social: Helpers.parseJSON(userResponse.social),
        bgImageVersion: userResponse.bgImageVersion,
        bgImageId: userResponse.bgImageId,
        profilePicture: userResponse.profilePicture,
        createdAt: userResponse.createdAt,
      } as IUserDocument;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again!');
    }
  }
}
