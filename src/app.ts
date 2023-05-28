import express, { type Express } from 'express';

import { config } from '@/root/config';
import dbConnection from '@/root/setupDatabase';
import { RootServer } from '@/root/setupServer';

class Application {
  public initialize(): void {
    this.loadConfig();
    dbConnection();
    const app: Express = express();
    const server: RootServer = new RootServer(app);

    server.start();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application: Application = new Application();

application.initialize();
