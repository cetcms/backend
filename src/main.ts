import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppService } from 'src/app.service';
import { LoggerService, Logger } from 'src/common/tools';

import { AppModule } from './app.module';

async function bootstrap() {
  const adapter = new ExpressAdapter();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter, {
    logger: LoggerService(),
  });
  const appService = app.get(AppService);
  appService.registerGlobal(app);
  appService.registerSwagger(app);
  await appService.setup(app);
}
bootstrap()
  .then(() => {
    Logger.debug('Application is running on: http://localhost:3000');
    Logger.debug('GraphQL is running on: http://localhost:3000/graphql');
    Logger.debug('Swagger is running on: http://localhost:3000/docs');
    Logger.info('Application is running on: http://localhost:3000');
  })
  .catch(console.error);
