import type { UploadApiResponse } from 'cloudinary';
import type { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

import { BadRequestError } from '@/root/errorsHandler';
import { QUEUES, RANDOM_NUMBER } from '@/global/constant';
import { zodValidation } from '@/global/decorators/zodValidation';
import { cloudinaryUploads } from '@/global/helpers/cloudinaryUpload';
import { Helpers } from '@/global/helpers/utils';
import { authServices } from '@/services/db/auth.service';
import { authQueue } from '@/services/queue/auth.queue';
import { userQueue } from '@/services/queue/user.queue';
import { UserCache } from '@/services/redis/user.cache';
import {
  SignUpValidate,
  TSignUpValidate,
} from '@/auth/schemas/signup.validate';
import { IAuthDocument, ISignUpData } from '@/auth/types';
import { IUserDocument } from '@/users/types';

const userCache: UserCache = new UserCache();

export class SignUp {
  @zodValidation(SignUpValidate)
  public async create(req: Request, res: Response): Promise<void> {
    const {
      avatarColor,
      email,
      username,
      password,
      avatarImage,
    }: TSignUpValidate = req.body;

    const existingUser: IAuthDocument | null =
      await authServices.getUserByUserNameOrEmail({ username, email });

    if (existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId: string = Helpers.generateRandomNumber(RANDOM_NUMBER);

    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      avatarColor,
      email,
      password,
      uId,
      username,
    });

    // Upload image to cloudinary
    const uploadResult: UploadApiResponse = (await cloudinaryUploads(
      avatarImage,
      `${userObjectId}`,
      true,
      true
    )) as UploadApiResponse;

    if (!uploadResult.public_id) {
      throw new BadRequestError('File upload: Error occured. Try again.');
    }

    const userDataForCache = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = uploadResult.secure_url;

    /**
     * Add to redis cache
     */
    userCache.saveUserToCache({
      key: `${userObjectId}`,
      createdUser: userDataForCache,
      userUid: uId,
    });

    /**
     * Add auth, user to database
     */
    authQueue.addAuthUserJob(QUEUES.ADD_AUTH_USER_JOB, { value: authData });
    userQueue.addUserJob(QUEUES.ADD_USER_JOB, { value: userDataForCache });

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'User created successfully',
    });
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, avatarColor, email, password, uId, username } = data;

    return {
      _id,
      avatarColor,
      email,
      password,
      uId,
      username,
      createdAt: new Date(),
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor, createdAt } =
      data;

    return {
      _id: userObjectId,
      authId: _id,
      username,
      email,
      password,
      avatarColor,
      uId,
      createdAt: createdAt.toISOString(),
      postsCount: 0,
      work: '',
      school: '',
      quote: '',
      location: '',
      blocked: [],
      blockedBy: [],
      followersCount: 0,
      followingCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true,
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
      bgImageVersion: '',
      bgImageId: '',
      profilePicture: '',
    } as unknown as IUserDocument;
  }
}
