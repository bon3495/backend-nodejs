import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { config } from '@/root/config';
import { BadRequestError } from '@/root/errorsHandler';
import { ACCESS_TOKEM_EXPIRES, REFRESH_TOKEM_EXPIRES } from '@/global/constant';
import { zodValidation } from '@/global/decorators/zodValidation';
import { Helpers } from '@/global/helpers/utils';
import { authServices } from '@/services/db/auth.service';
import { userService } from '@/services/db/user.service';
import { AuthCache } from '@/services/redis/auth.cache';
import { LogInValidate, TLogInValidate } from '@/auth/schemas/login.validate';
import { IAuthPayload } from '@/auth/types';

const authCache: AuthCache = new AuthCache();

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

    const payloadJWT: IAuthPayload = {
      userId: `${user._id}`,
      username: existingAuthUser.username,
      email: existingAuthUser.email,
      uId: existingAuthUser.uId,
      avatarColor: existingAuthUser.avatarColor,
    };

    const accessToken = Helpers.signJWT(payloadJWT, config.JWT_TOKEN!, {
      expiresIn: ACCESS_TOKEM_EXPIRES,
    });

    const refreshToken = Helpers.signJWT(
      payloadJWT,
      config.JWT_TOKEN_REFRESH!,
      {
        expiresIn: REFRESH_TOKEM_EXPIRES,
      }
    );

    // Save the refresh token into Redis
    await authCache.saveRefreshTokenToCache({
      userId: `${user._id}`,
      token: refreshToken,
      options: { EX: REFRESH_TOKEM_EXPIRES },
    });

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'User login successfully',
      data: {
        user,
      },
      token: { accessToken, refreshToken },
    });
  }
}
