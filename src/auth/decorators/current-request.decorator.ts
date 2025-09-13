/**
 * CurrentRequest 参数装饰器
 *
 * 功能描述：
 * - 从 ExecutionContext 中提取并返回底层 Request 对象（GraphQL 场景下为 ctx.getContext().req）。
 * - 兼容 HTTP、GraphQL、WS、RPC 等上下文（适配逻辑由 RequestHandler 提供）。
 *
 * 参数说明：
 * - data: any
 *   - 类型：any
 *   - 用途：传递给装饰器的数据参数，当前未使用。
 * - ctx: ExecutionContext
 *   - 类型：NestJS ExecutionContext
 *   - 用途：提供当前处理器的执行上下文，用于定位当前请求并提取 request 对象。
 *
 * 返回值说明：
 * - 返回类型：Request（Express）
 * - 含义：当前执行上下文对应的请求对象。
 *
 * 使用示例：
 * - GraphQL Resolver：
 *   @Query(() => String)
 *   ip(@CurrentRequest() req: Request) {
 *     return req.ip;
 *   }
 *
 * 注意事项：
 * - 依赖 RequestHandler 从不同类型的上下文中获取 Request。
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestHandler } from 'src/common/handlers';

export const CurrentRequest = createParamDecorator((data: any, ctx: ExecutionContext) => {
  return RequestHandler(ctx);
});
