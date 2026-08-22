import { ArgumentsHost, Catch, ExceptionFilter, ContextType } from '@nestjs/common';

import { I18nService } from 'src/i18n';

import { GraphQLExceptionFilter } from './graphql-exception.filter';
import { HttpExceptionFilter } from './http-exception.filter';

@Catch()
export class ExtensionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}
  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType<ContextType | 'graphql'>();
    switch (type) {
      case 'http':
        return new HttpExceptionFilter(this.i18n).catch(exception, host);
      case 'graphql':
        return new GraphQLExceptionFilter(this.i18n).catch(exception, host);
      default:
        throw exception;
    }
  }
}
