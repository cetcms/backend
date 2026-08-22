import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { I18nService } from 'src/i18n';
import { ZodError } from 'zod';

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
      errors: [] as any[],
    };

    if (exception instanceof ZodError) {
      response.code = 'ZOD0001';
      response.message = t('exception:validation');
      response.errors = exception.issues.map((issue) => {
        return {
          code: issue.code,
          message: issue.message,
          path: issue.path.join('.'),
        };
      });
    }

    // Handle Prisma errors according to Prisma error reference
    if (exception.name === Prisma.PrismaClientKnownRequestError.name) {
      const options: { [key: string]: any } = {};
      const { modelName, target } = exception.meta || {};
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
