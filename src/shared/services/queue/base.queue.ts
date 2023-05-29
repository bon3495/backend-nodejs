import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Queue, { type Job } from 'bull';
import Logger from 'bunyan';

import { config } from '@/root/config';
import { QUEUES_PATH } from '@/global/constant';
import { IAuthJob } from '@/auth/types';
import { IUserJob } from '@/users/types';

export type TBaseJobData = IAuthJob | IUserJob;

let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));

    // Remove duplicates queue
    bullAdapters = [...new Set(bullAdapters)];

    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(QUEUES_PATH);

    createBullBoard({
      queues: bullAdapters,
      serverAdapter,
    });

    this.log = config.createLogger(`${queueName}Queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });
  }

  protected addJob(name: string, data: TBaseJobData): void {
    this.queue.add(name, data, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 },
    });
  }

  protected processJob<TBaseJobData>(
    name: string,
    concurrency: number,
    callback: Queue.ProcessCallbackFunction<TBaseJobData>
  ): void {
    this.queue.process(name, concurrency, callback);
  }
}
