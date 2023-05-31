import { z } from 'zod';

export const AuthValidate = z.object({
  refreshToken: z
    .string({
      required_error: 'Refresh token is a required field',
      invalid_type_error: 'Refresh token must be of type string',
    })
    .trim(),
});

export type TAuthValidate = z.infer<typeof AuthValidate>;
