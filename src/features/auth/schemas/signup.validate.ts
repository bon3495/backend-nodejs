import { z } from 'zod';

import { USER_NAME_MAX_LENGTH, USER_NAME_MIN_LENGTH } from '@/global/constant';

export const SignUpValidate = z.object({
  username: z
    .string({
      required_error: 'Username is a required field',
      invalid_type_error: 'Username must be of type string',
    })
    .trim()
    .min(USER_NAME_MIN_LENGTH, {
      message: `Username must be ${USER_NAME_MIN_LENGTH} or more characters long`,
    })
    .max(USER_NAME_MAX_LENGTH, {
      message: `Username must be ${USER_NAME_MAX_LENGTH} or fewer characters long`,
    }),

  password: z
    .string({
      required_error: 'Password is a required field',
      invalid_type_error: 'Password must be of type string',
    })
    .trim()
    .min(USER_NAME_MIN_LENGTH, {
      message: `Password must be ${USER_NAME_MIN_LENGTH} or more characters long`,
    })
    .max(USER_NAME_MAX_LENGTH, {
      message: `Password must be ${USER_NAME_MAX_LENGTH} or fewer characters long`,
    }),

  email: z
    .string({
      required_error: 'Email is a required field',
      invalid_type_error: 'Email must be of type string',
    })
    .trim()
    .email({ message: 'Invalid email address' }),

  avatarColor: z
    .string({
      required_error: 'Avatar color is a required field',
    })
    .trim(),

  avatarImage: z
    .string({
      required_error: 'Avatar image is a required field',
    })
    .trim(),
});

export type TSignUpValidate = z.infer<typeof SignUpValidate>;
