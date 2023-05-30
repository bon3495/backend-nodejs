import express, { type Router } from 'express';

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

    return this.router;
  }

  public logOutRoute(): Router {
    this.router.get('/logout', LogOut.prototype.update);

    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
