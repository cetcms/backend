/**
 * CurrentAuth 参数装饰器
 *
 * 功能描述：
 * - 从当前请求上下文中提取认证信息（Auth），若不存在则抛出 401 Unauthorized 异常。
 * - 适用于 GraphQL、HTTP、WS、RPC 等 Nest 运行时上下文（由 ContextHandler 适配）。
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
 * - 返回类型：Auth（GraphQL 生成类型）
 * - 含义：当前请求关联的认证信息对象，包含 target、member/admin、company 等字段。
 *
 * 使用示例：
 * - GraphQL Resolver：
 *   @Query(() => String)
 *   hello(@CurrentAuth() auth: CurrentAuth) {
 *     return `Hello ${auth.target}`;
 *   }
 *
 * 注意事项：
 * - 当 request.authInfo 为空时，会抛出 UnauthorizedException（401）。
 * - 依赖 ContextHandler(ctx) 从不同类型的上下文中获取 Request；确保在全局拦截器/守卫中正确设置 request.authInfo。
 */
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { ContextHandler } from 'src/common/handlers';
import { AdminRole, CompanyRole } from 'src/generated/graphql';
import { Auth } from 'src/generated/graphql/auth';

export interface CurrentAuth extends Auth {
  companyRole?: CompanyRole;
  adminRole?: AdminRole;
  permissions?: Array<string>;
}

export const CurrentAuth = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ContextHandler(ctx).getRequest();
  const authInfo = <Auth | null>request.authInfo;
  if (!authInfo) {
    throw new UnauthorizedException({
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  }
  return authInfo;
});
