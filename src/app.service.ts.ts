import path from 'node:path';

import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request } from 'express';
import { Logger } from 'src/common';
import { LoggingInterceptor } from 'src/common/interceptors';
import { ConfigService } from 'src/config';
import { RequestKeys } from 'src/contracts';
import { I18nService } from 'src/i18n';

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly i18n: I18nService
  ) {}

  async setup(app: NestExpressApplication) {
    const { port } = this.config.getAppConfig();
    app.enableCors();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      this.i18n.changeLanguage(this.i18n.requestLanguage(req));
      req.app.set(RequestKeys.Instance, app);
      req.app.set(RequestKeys.Locale, this.i18n.currentLanguage());
      next();
    });
    await app.listen(port);
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
