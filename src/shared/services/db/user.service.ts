import { UserModel } from '@/users/model/user.model';
import { IUserDocument } from '@/users/types';

class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
}

export const userService: UserService = new UserService();
