import { CONCURRENCY_NUMBER, GLOBAL, QUEUES } from '@/global/constant';
import { BaseQueue } from '@/services/queue/base.queue';
import { userWorker } from '@/workers/user.worker';
import { IUserJob } from '@/users/types';

class UserQueue extends BaseQueue {
  constructor() {
    super(GLOBAL.USER);
    this.processJob(
      QUEUES.ADD_USER_JOB,
      CONCURRENCY_NUMBER,
      userWorker.addUserToDB
    );
  }

  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
