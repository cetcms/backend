import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { AppService } from 'src/app.service';

import { AppModule } from './app.module';

async function bootstrap() {
  const adapter = new ExpressAdapter();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter);
  const appService = app.get(AppService);
  appService.setupSwagger(app);
  await appService.setup(app);
}
bootstrap()
  .then(() => {
    console.log('Application is running on: http://localhost:3000');
    console.log('GraphQL is running on: http://localhost:3000/graphql');
    console.log('Swagger is running on: http://localhost:3000/docs');
  })
  .catch(console.error);
