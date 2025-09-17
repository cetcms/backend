import path from 'node:path';

import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'src/common';
import { LoggingInterceptor } from 'src/common/interceptors';

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);

  async setup(app: NestExpressApplication) {
    await app.listen(process.env.PORT ?? 3000);
  }

  registerGlobal(app: NestExpressApplication) {
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useStaticAssets(path.join(__dirname, '..', 'public'));
  }

  registerSwagger(app: NestExpressApplication, path = 'docs') {
    const config = new DocumentBuilder()
      .setTitle('Cats example')
      .setDescription('The cats API description')
      .setVersion('1.0')
      .addBearerAuth()
      .addExtension('x-a', {})
      .build();
    SwaggerModule.setup(path, app, SwaggerModule.createDocument(app, config));
  }

  health() {
    return 'ok';
  }
}
