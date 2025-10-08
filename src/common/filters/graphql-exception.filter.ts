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
      switch (exception.code) {
        case 'P2002': {
          const modelName = exception.meta?.modelName;
          const target = exception.meta?.target;
          let field = '';

          if (modelName && target) {
            if (Array.isArray(target)) {
              field = t(`models:${modelName}.${target.join('.')}`);
            } else {
              field = t(`models:${modelName}.${target}`);
            }
          }

          response.path = Array.isArray(target) ? target.join('.') : target;
          response.message = t('exception:prisma.P2002', { field });
          break;
        }
        default:
          response.message = t(`exception:prisma.${exception.code}`);
      }
    }

    throw new HttpException(JSON.stringify(response), exception.status);
  }
}
