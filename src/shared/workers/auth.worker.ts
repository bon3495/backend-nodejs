import type { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

import { config } from '@/root/config';
import { GLOBAL } from '@/global/constant';
import { authServices } from '@/services/db/auth.service';
import { TBaseJobData } from '@/services/queue/base.queue';
import { IAuthDocument } from '@/auth/types';

const log: Logger = config.createLogger(GLOBAL.AUTH_WORKER);

class AuthWorker {
  async addAuthUserToDB(
    job: Job<TBaseJobData>,
    done: DoneCallback
  ): Promise<void> {
    try {
      const { value } = job.data;
      await authServices.createAuthUser(value as IAuthDocument);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
