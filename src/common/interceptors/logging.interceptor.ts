import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JsonMask, Logger } from 'src/common';
import { ContextHandler, RequestHandler } from 'src/common/handlers';
import { RequestLog } from 'src/generated/graphql';
import { v7 as uuid } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = ContextHandler(context).getType();
    const request = ContextHandler(context).getRequest();
    const req = RequestHandler(request);
    const auth = req.getAuthInfo();
    const data: RequestLog = {
      id: uuid(),
      recordAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      route: req.getRoute(),
      method: type === 'GRAPHQL' ? type : req.getMethod(),
      ip: req.getIp(),
      subject: context.getClass().name,
      action: context.getHandler().name,
      query: req.getQuery(),
      language: req.getLanguage(),
      fingerprint: req.getFingerprint(),
      device: req.getDevice(),
      location: req.getLocation(),
      target: auth?.target || null,
      userId: auth?.userId || null,
      adminId: auth?.adminId || null,
      companyId: auth?.companyId || null,
      beforeAt: new Date(),
      afterAt: null,
      headers: req.getHeaders(),
      body: req.getBody(),
      params: req.getParams(),
      duration: 0n,
    };
    this.logger.request(JsonMask(data));
    return next.handle().pipe(
      tap(() => {
        data.afterAt = new Date();
        data.duration = BigInt(data.afterAt.getTime() - data.beforeAt.getTime());
      })
    );
  }
}
