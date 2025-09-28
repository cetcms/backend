import { ArgumentsHost, Catch, ExceptionFilter, HttpException, ContextType } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class ExtensionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const type = host.getType<ContextType | 'graphql'>();
    switch (type) {
      case 'http': {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response.status(status).json({
          statusCode: status,
          message: exception.message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
      }
      default:
        throw exception;
    }
  }
}
