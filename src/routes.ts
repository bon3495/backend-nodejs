import { Application } from 'express';

import { BASE_PATH, QUEUES_PATH } from '@/global/constant';
import { serverAdapter } from '@/services/queue/base.queue';
import { authRoutes } from '@/auth/routes/auth.route';

export default (app: Application) => {
  const routes = () => {
    app.use(QUEUES_PATH, serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.logOutRoute());
  };

  routes();
};
