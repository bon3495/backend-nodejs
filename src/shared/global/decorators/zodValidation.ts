import { z, ZodError } from 'zod';

import { InternetServerError, ZodValidateError } from '@/root/errorsHandler';

type TZodDecorator = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => void;

export function zodValidation(schema: z.ZodObject<any>): TZodDecorator {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const req: Request = args[0];
        schema.parse(req.body);
        return originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof ZodError) {
          const errors = error.errors.map(err => err.message).join(';');
          throw new ZodValidateError(errors);
        }

        throw new InternetServerError('Internal server error');
      }
    };
    return descriptor;
  };
}
