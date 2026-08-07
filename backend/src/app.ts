import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, UPLOAD_ROOT, IMAGE_STORAGE_PATH } from '@config';
import { dbConnection } from '@database';
import { Routes } from '@interfaces/routes.interface';
import { logger, stream } from '@utils/logger';
import path from 'path';
export class App {
  public app: express.Application;
  public env: string;
  public port: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = String(PORT || 5601);

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    await dbConnection();
  }

  private initializeMiddlewares() {
    // this.app.use(morgan(LOG_FORMAT, { stream }));
       const allowedOrigins = [
      "http://localhost:3055",
      "http://localhost:5173",
<<<<<<< HEAD
      "http://localhost:3000",
      process.env.FRONTEND_ORIGIN, // set this in the root .env to your public frontend URL
=======
      "https://srv-bs2.lmstream.xyz",
      "https://rentease.lmstream.xyz",
      "https://srv-expiner.lmstream.xyz",
      process.env.FRONTEND_ORIGIN, // allow overriding via env without rebuild
>>>>>>> origin/main
    ].filter(Boolean);
    // this.app.use(morgan(LOG_FORMAT, { stream }));
    // this.app.use(cors());

    // Required so req.cookies is populated — used by /auth/verify to read the
    // session JWT stored in the `Authorization` cookie. Without this middleware
    // req.headers.cookie is the raw string and req.cookies is undefined.
    this.app.use(cookieParser());

    this.app.use(cors({
      origin: allowedOrigins,   // مصفوفة
      credentials: true,        // مطلوب إذا كنت ترسل كوكي
    }),);
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    this.app.use('/img', express.static(IMAGE_STORAGE_PATH));
    this.app.use('/photos', express.static(IMAGE_STORAGE_PATH));
    this.app.use('/uploads', express.static(UPLOAD_ROOT));
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    // Load the spec from swagger.yaml at the project root. We read the file
    // ourselves rather than using swagger-jsdoc's `apis` glob so the path is
    // always resolved relative to the compiled file (works under ts-node,
    // dist/server.js, jest, etc.) and not the process working directory.
    // Resolves `../swagger.yaml` from `dist/` (or `src/` under ts-node).
    const specPath = path.join(__dirname, '..', 'swagger.yaml');
    const yaml = require('fs').readFileSync(specPath, 'utf8');
    const yamlLib = require('js-yaml');
    const spec = yamlLib.load(yaml);

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

}
