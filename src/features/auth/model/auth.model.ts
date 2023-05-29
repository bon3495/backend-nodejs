import { compare, hash } from 'bcryptjs';
import { Model, model, Schema } from 'mongoose';

import { SALT_ROUND } from '@/global/constant';
import { IAuthDocument } from '@/auth/types';

const authSchema: Schema = new Schema<IAuthDocument>(
  {
    username: String,
    uId: String,
    email: String,
    password: String,
    avatarColor: String,
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: String, default: '' },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const hashedPassword: string = await hash(
    this.password as string,
    SALT_ROUND
  );
  this.password = hashedPassword;
  next();
});

authSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password!;
  return compare(password, hashedPassword);
};

authSchema.methods.hashPassword = async function (
  password: string
): Promise<string> {
  return hash(password, SALT_ROUND);
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>(
  'Auth',
  authSchema,
  'Auth'
);

export { AuthModel };
