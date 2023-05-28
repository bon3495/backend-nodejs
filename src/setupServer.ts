import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import type Logger from 'bunyan';
import compression from 'compression';
import cookieSession from 'cookie-session';
import cors from 'cors';
import {
  json,
  urlencoded,
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import HTTP_STATUS from 'http-status-codes';
import { createClient } from 'redis';
import { Server as SocketServer } from 'socket.io';

import 'express-async-errors';
import { config } from '@/root/config';
import { CustomError, IErrorResponse } from '@/root/errorsHandler';
import routes from '@/root/routes';

const SERVER_PORT = 5000;
const log: Logger = config.createLogger('rootServer');

export class RootServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandle(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 60 * 60 * 1000 * 7, // 24 hours * 7
        secure: config.NODE_ENV !== 'development', // set false only on development mode. Production -> set true
      })
    );

    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: HTTP_STATUS.OK,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routesMiddleware(app: Application): void {
    routes(app);
  }

  private globalErrorHandle(app: Application): void {
    app.all('*', (req: Request, res: Response): void => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: `${req.originalUrl} not found.`,
        status: HTTP_STATUS.NOT_FOUND,
      });
    });

    app.use(
      (
        error: IErrorResponse,
        _: Request,
        res: Response,
        next: NextFunction
      ) => {
        log.error(error);
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }

        next();
      }
    );
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: HttpServer = new HttpServer(app);
      const socketIO = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: HttpServer): Promise<SocketServer> {
    const io: SocketServer = new SocketServer(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      },
    });

    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));

    return io;
  }

  private startHttpServer(httpServer: HttpServer): void {
    httpServer.listen(SERVER_PORT, async () => {
      console.log(`Server is running at http://localhost:${SERVER_PORT}`);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private socketIOConnections(io: SocketServer): void {
    log.info('socketIOConnections');
  }
}
