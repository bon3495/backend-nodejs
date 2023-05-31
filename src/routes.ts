import { Application } from 'express';

import { BASE_PATH, QUEUES_PATH } from '@/global/constant';
import { authMiddleware } from '@/global/helpers/authMiddleware';
import { serverAdapter } from '@/services/queue/base.queue';
import { authRoutes } from '@/auth/routes/auth.route';
import { currentUserRoutes } from '@/auth/routes/currentUser.route';

export default (app: Application) => {
  const routes = () => {
    app.use(QUEUES_PATH, serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());

    app.use(
      BASE_PATH,
      authMiddleware.checkAuthentication,
      authRoutes.logOutRoute()
    );

    app.use(
      BASE_PATH,
      authMiddleware.checkAuthentication,
      currentUserRoutes.routes()
    );
  };

  routes();
};
