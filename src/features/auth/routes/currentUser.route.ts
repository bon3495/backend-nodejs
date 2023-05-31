import express, { Router } from 'express';

import { authMiddleware } from '@/global/helpers/authMiddleware';
import { CurrentUser } from '@/auth/controllers/currentUser.controller';

class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      '/current-user',
      authMiddleware.verifyUser,
      CurrentUser.prototype.getUser
    );

    return this.router;
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
