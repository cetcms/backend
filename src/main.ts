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
  await appService.start(app);
}
bootstrap()
  .then(() => {
    Logger.debug('Application is started');
  })
  .catch(console.error);
