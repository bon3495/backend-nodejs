import { CONCURRENCY_NUMBER, GLOBAL, QUEUES } from '@/global/constant';
import { BaseQueue } from '@/services/queue/base.queue';
import { authWorker } from '@/workers/auth.worker';
import { IAuthJob } from '@/auth/types';

class AuthQueue extends BaseQueue {
  constructor() {
    super(GLOBAL.AUTH);
    this.processJob(
      QUEUES.ADD_AUTH_USER_JOB,
      CONCURRENCY_NUMBER,
      authWorker.addAuthUserToDB
    );
  }

  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();
