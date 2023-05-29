import { QueryOptions } from 'mongoose';

import { AuthModel } from '@/auth/model/auth.model';
import { IAuthDocument } from '@/auth/types';

class AuthServices {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

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
