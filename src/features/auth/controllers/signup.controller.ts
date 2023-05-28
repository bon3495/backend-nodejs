import type { UploadApiResponse } from 'cloudinary';
import type { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

import { BadRequestError } from '@/root/errorsHandler';
import { RANDOM_NUMBER } from '@/global/constant';
import { zodValidation } from '@/global/decorators/zodValidation';
import { cloudinaryUploads } from '@/global/helpers/cloudinaryUpload';
import { Helpers } from '@/global/helpers/utils';
import { authServices } from '@/services/db/auth.service';
import { IAuthDocument, ISignUpData } from '@/auth/interfaces';
import {
  SignUpValidate,
  TSignUpValidate,
} from '@/auth/schemas/signup.validate';

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
    const uId: string = `${Helpers.generateRandomNumber(RANDOM_NUMBER)}`;

    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      avatarColor,
      email,
      password,
      uId,
      username,
    });

    const result: UploadApiResponse = (await cloudinaryUploads(
      avatarImage,
      `${userObjectId}`,
      true,
      true
    )) as UploadApiResponse;

    if (!result.public_id) {
      throw new BadRequestError('File upload: Error occured. Try again.');
    }

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      data: { user: authData },
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
}
