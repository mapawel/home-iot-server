import express, { Express } from 'express';

import { ConfigBuilder } from './config-builder/Config-builder';
import { config } from './config-builder/config.type';

const { config }: { config: config } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;

  public async start() {
    try {
      await this.app.listen(this.port);
      console.log(`App is listening on ${this.port}`);
    } catch (err) {
      console.warn(`Problem with starting server on port ${this.port}`);
    }
  }
}

const server = new Server();
(async () => await server.start())();
