import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { I18nService } from 'src/i18n';

@Catch()
export class GraphQLExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: any, _host: ArgumentsHost) {
    const { t } = await this.i18n.useTranslation();
    const response = {
      code: exception.code,
      message: exception.message,
      statusCode: exception.status,
      timestamp: new Date().toISOString(),
      path: exception.path,
    };

    // Handle Prisma errors according to Prisma error reference
    if (exception.code && exception.code.startsWith('P')) {
      const options: { [key: string]: any } = {};
      const { modelName, target } = exception.meta;
      if (modelName && target) {
        if (Array.isArray(target)) {
          options.field = t(`models:${modelName}.${target.join('.')}`);
        } else {
          options.field = t(`models:${modelName}.${target}`);
        }
      }
      if (target) {
        response.path = Array.isArray(target) ? target.join('.') : target;
      }
      response.message = t(`exception:prisma.${exception.code}`, options);
    }

    throw new HttpException(JSON.stringify(response), exception.status);
  }
}
