import { USER_NAME_MAX_LENGTH, USER_NAME_MIN_LENGTH } from '@/global/constant';
import { z } from 'zod';

export const EmailValidate = z.object({
  email: z
    .string({
      required_error: 'Email is a required field',
      invalid_type_error: 'Email must be of type string',
    })
    .trim()
    .email({ message: 'Invalid email address' }),
});

export const PasswordValidate = z
  .object({
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

    confirmPassword: z
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
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // path of error
  });

export type emailValidate = z.infer<typeof EmailValidate>;
