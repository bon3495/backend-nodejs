import JWT from 'jsonwebtoken';

import { IAuthPayload } from '@/auth/types';

export class Helpers {
  static generateRandomNumber(integerLength: number): string {
    const characters = '123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  static convertToLowerCase(str: string): string {
    return str.toLowerCase();
  }

  static parseJSON<TType>(prop: string): TType {
    return JSON.parse(prop);
  }

  static signJWT(
    object: IAuthPayload,
    keyName: string,
    options?: JWT.SignOptions
  ): string {
    return JWT.sign(object, keyName, {
      ...(options && options),
    });
  }
}
