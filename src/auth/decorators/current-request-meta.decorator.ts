import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ContextHandler, RequestHandler } from 'src/common/handlers';

export interface CurrentRequestMeta {
  ip: string | null;
  userAgent: string | null;
  fingerprint: string | null;
}

export const CurrentRequestMeta = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ContextHandler(ctx).getRequest();
  const req = RequestHandler(request);
  const meta: CurrentRequestMeta = {
    ip: req.getIp(),
    userAgent: req.getUserAgent(),
    fingerprint: req.getFingerprint(),
  };
  return meta;
});
