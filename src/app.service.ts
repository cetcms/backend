import os from 'node:os';
import path from 'node:path';

import { Injectable, Logger, RequestMethod } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { graphqlUploadExpress } from 'graphql-upload-ts';

import { ExtensionsFilter } from 'src/common/filters';
import { LoggingInterceptor } from 'src/common/interceptors';
import { ConfigService } from 'src/config/config.service';
import { RequestKeys } from 'src/contracts';
import { I18nService } from 'src/i18n/i18n.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private app: NestExpressApplication;

  constructor(private readonly configService: ConfigService) {}

  async start(app: NestExpressApplication) {
    const config = this.configService.getAppConfig();
    const { maxFileSize } = this.configService.getStorageConfig();

    const i18n = app.get(I18nService);

    this.app = app;

    this.app.setGlobalPrefix('/api', {
      exclude: [
        { path: 'health', method: RequestMethod.GET },
        { path: 'media/*path', method: RequestMethod.GET },
      ],
    });

    this.app.use(
      graphqlUploadExpress({
        overrideSendResponse: false,
        maxFileSize,
        maxFiles: 5,
      })
    );

    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      i18n.changeLanguage(i18n.requestLanguage(req));
      req.app.set(RequestKeys.Instance, this.app);
      req.app.set(RequestKeys.Locale, i18n.currentLanguage());
      next();
    });

    this.app.enableCors();

    this.app.useStaticAssets(path.join(process.cwd(), 'public'));

    this.app.useGlobalFilters(new ExtensionsFilter(i18n));

    this.app.useGlobalInterceptors(new LoggingInterceptor());

    const docsConfig = new DocumentBuilder()
      .setTitle('CETCMS')
      .setDescription('The CETCMS API description')
      .setVersion('1.0')
      .addBearerAuth()
      .addExtension('x-a', {})
      .build();
    SwaggerModule.setup('docs', this.app, SwaggerModule.createDocument(this.app, docsConfig));

    if (config.environment === 'test') {
      await this.app.init();
    } else {
      await this.app.listen(config.port, '0.0.0.0');
      const url = await this.getAppUrl(true);
      this.logger.debug(`- Application is running on: ${config.environment}`);
      this.logger.debug(`- Network: ${await this.getAppUrl()}`);
      this.logger.debug(`- Local:   ${url}`);
      this.logger.debug(`- GraphQL is running on: ${url}/graphql`);
      this.logger.debug(`- Swagger is running on: ${url}/docs`);
    }
  }

  async getAppUrl(isLocal = false) {
    const localhost = '127.0.0.1';
    let url = await this.app.getUrl();
    url = url.replace('0.0.0.0', localhost);

    if (isLocal) return url;

    const config = this.configService.getAppConfig();
    const interfaces = os.networkInterfaces();
    const networks = Object.values(interfaces).reduce((res, cur) => [...(res || []), ...(cur || [])], []);
    const network = networks?.find((item) => item.family === 'IPv4' && item.address !== '127.0.0.1' && !item.internal);

    url = url.replace(localhost, config.host);
    return url.replace(localhost, network?.address || localhost);
  }
  health() {
    return 'ok';
  }
}
