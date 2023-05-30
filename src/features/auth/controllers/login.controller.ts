import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';

import { config } from '@/root/config';
import { BadRequestError } from '@/root/errorsHandler';
import { zodValidation } from '@/global/decorators/zodValidation';
import { authServices } from '@/services/db/auth.service';
import { userService } from '@/services/db/user.service';
import { LogInValidate, TLogInValidate } from '@/auth/schemas/login';

export class LogIn {
  @zodValidation(LogInValidate)
  public async read(req: Request, res: Response): Promise<void> {
    const { password, username }: TLogInValidate = req.body;

    // Check existing auth user in DB
    const existingAuthUser = await authServices.getUserByUserNameOrEmail({
      username,
    });

    if (!existingAuthUser) {
      throw new BadRequestError('Invalid credentials');
    }

    // Check password is match
    const passwordsMatch = await existingAuthUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const user = await userService.getUserByAuthId(`${existingAuthUser._id}`);

    const userJWT = JWT.sign(
      {
        userId: user._id,
        username: existingAuthUser.username,
        email: existingAuthUser.email,
        uId: existingAuthUser.uId,
        avatarColor: existingAuthUser.avatarColor,
      },
      config.JWT_TOKEN!
    );

    req.session = { jwt: userJWT };

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'User login successfully',
      data: {
        user,
      },
      token: userJWT,
    });
  }
}
