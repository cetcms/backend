import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

@Injectable()
export class AppService {
  setupSwagger(app: NestExpressApplication, path = 'docs') {
    const config = new DocumentBuilder()
      .setTitle('Cats example')
      .setDescription('The cats API description')
      .setVersion('1.0')
      .build();
    SwaggerModule.setup(path, app, SwaggerModule.createDocument(app, config));
  }

  async setup(app: NestExpressApplication) {
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ?? 3000);
  }

  health() {
    return 'ok';
  }
}
