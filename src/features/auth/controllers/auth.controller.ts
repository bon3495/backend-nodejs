import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { config } from '@/root/config';
import { ACCESS_TOKEM_EXPIRES } from '@/global/constant';
import { zodValidation } from '@/global/decorators/zodValidation';
import { Helpers } from '@/global/helpers/utils';
import { AuthValidate } from '@/auth/schemas/auth.validate';
import { IAuthPayload } from '@/auth/types';

export class AuthControl {
  @zodValidation(AuthValidate)
  public async refreshToken(req: Request, res: Response): Promise<void> {
    const payloadJWT: IAuthPayload = {
      userId: `${req.currentUser!.userId}`,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      uId: req.currentUser!.uId,
      avatarColor: req.currentUser!.avatarColor,
    };

    const newAccessToken = Helpers.signJWT(payloadJWT, config.JWT_TOKEN!, {
      expiresIn: ACCESS_TOKEM_EXPIRES,
    });

    res.status(HTTP_STATUS.OK).json({
      status: HTTP_STATUS.OK,
      message: 'Refreshing new access token successfully',
      token: {
        accessToken: newAccessToken,
      },
    });
  }
}
