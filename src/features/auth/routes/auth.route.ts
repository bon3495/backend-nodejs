import express, { type Router } from 'express';

import { authMiddleware } from '@/global/helpers/authMiddleware';
import { AuthControl } from '@/auth/controllers/auth.controller';
import { LogIn } from '@/auth/controllers/login.controller';
import { LogOut } from '@/auth/controllers/logout.controller';
import { SignUp } from '@/auth/controllers/signup.controller';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.create);
    this.router.post('/login', LogIn.prototype.read);

    this.router.post(
      '/refresh-token',
      authMiddleware.verifyRefreshToken,
      AuthControl.prototype.refreshToken
    );

    return this.router;
  }

  /**
   * Separate log out from other route because If users want to log out, They have to be signed in first. Need to requires some form of authentication before they can sign out.
   */
  public logOutRoute(): Router {
    this.router.get(
      '/logout',
      authMiddleware.verifyUser,
      LogOut.prototype.update
    );

    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
