import { QueryOptions } from 'mongoose';

import { IAuthDocument } from '@/auth/interfaces';
import { AuthModel } from '@/auth/model/auth.model';

class AuthServices {
  public async getUserByUserNameOrEmail({
    username,
    email,
  }: {
    username?: string;
    email?: string;
  }): Promise<IAuthDocument | null> {
    const query: QueryOptions = {
      $or: [{ username }, { email }],
    };

    const user: IAuthDocument | null = await AuthModel.findOne(query).exec();
    return user;
  }
}

export const authServices: AuthServices = new AuthServices();
