/**
 * CurrentRequestMeta 参数装饰器
 *
 * 功能描述：
 * - 从当前请求上下文中提取请求元信息（IP地址、Member-Agent、指纹等）
 * - 封装这些信息为 CurrentRequestMeta 对象返回
 *
 * 参数说明：
 * - data: any
 *   - 类型：any
 *   - 用途：传递给装饰器的数据参数，当前未使用
 * - ctx: ExecutionContext
 *   - 类型：NestJS ExecutionContext
 *   - 用途：提供当前处理器的执行上下文，用于定位当前请求并提取 request 对象
 *
 * 返回值说明：
 * - 返回类型：CurrentRequestMeta
 * - 含义：包含请求元信息的对象，包括IP地址、Member-Agent和指纹
 *
 * 使用示例：
 * - GraphQL Resolver：
 *   @Query(() => String)
 *   logRequest(@CurrentRequestMeta() meta: CurrentRequestMeta) {
 *     console.log('IP:', meta.ip);
 *     console.log('Member-Agent:', meta.memberAgent);
 *     console.log('Fingerprint:', meta.fingerprint);
 *     return 'ok';
 *   }
 *
 * 注意事项：
 * - 依赖 ContextHandler 从不同类型的上下文中获取 Request
 * - 依赖 RequestHandler 处理请求对象以获取特定信息
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { ContextHandler, RequestHandler } from 'src/common/handlers';

export interface CurrentRequestMeta {
  ip: string | null;
  memberAgent: string | null;
  fingerprint: string | null;
  origin: string | null;
  frontendDomain: string | null;
}

export const CurrentRequestMeta = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ContextHandler(ctx).getRequest();
  const req = RequestHandler(request);
  const meta: CurrentRequestMeta = {
    ip: req.getIp(),
    memberAgent: req.getMemberAgent(),
    fingerprint: req.getFingerprint(),
    origin: req.getOrigin(),
    frontendDomain: req.getFrontendDomain(),
  };
  return meta;
});
