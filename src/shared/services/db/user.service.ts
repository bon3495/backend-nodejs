import mongoose from 'mongoose';

import { UserModel } from '@/users/model/user.model';
import { IUserDocument } from '@/users/types';

class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'Auth',
          localField: 'authId',
          foreignField: '_id',
          as: 'authObject',
        },
      },
      { $unwind: '$authObject' },
      { $project: this.aggregateProject() },
    ]);

    return users[0];
  }

  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      {
        $lookup: {
          from: 'Auth',
          localField: 'authId',
          foreignField: '_id',
          as: 'authObject',
        },
      },
      { $unwind: '$authObject' },
      { $project: this.aggregateProject() },
    ]);

    return users[0];
  }

  private aggregateProject() {
    return {
      _id: 1,
      username: '$authObject.username',
      uId: '$authObject.uId',
      email: '$authObject.email',
      avatarColor: '$authObject.avatarColor',
      createdAt: '$authObject.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1,
      authId: '$authObject._id',
    };
  }
}

export const userService: UserService = new UserService();
