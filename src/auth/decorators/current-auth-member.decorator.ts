/**
 * CurrentAuthMember 参数装饰器
 *
 * 功能描述：
 * - 从当前请求上下文中提取认证信息（Auth），并校验是否包含 Member 身份。
 * - 若未认证或不含 member，分别抛出 401 或 403 异常。
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
 * - 返回类型：Member（GraphQL 生成类型）
 * - 含义：当前认证的成员对象。
 *
 * 使用示例：
 * - GraphQL Resolver：
 *   @Query(() => Member)
 *   me(@CurrentAuthMember() member: Member) {
 *     return member;
 *   }
 *
 * 注意事项：
 * - 当 request.authInfo 为空时抛出 UnauthorizedException（401）。
 * - 当 authInfo.member 为空时抛出 ForbiddenException（403）。
 * - 依赖 ContextHandler(ctx) 正确获取 Request；确保在认证逻辑中写入 request.authInfo。
 */
import { createParamDecorator, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ContextHandler } from 'src/common/handlers';
import { Auth } from 'src/generated/graphql/auth';

export const CurrentAuthMember = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ContextHandler(ctx).getRequest();
  const authInfo = <Auth | null>request.authInfo;
  if (!authInfo) {
    throw new UnauthorizedException({
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  }

  if (authInfo.member) {
    return authInfo.member;
  }

  throw new ForbiddenException({
    message: 'You are not authorized to access this resource',
    code: 'NOT_AUTHORIZED',
  });
});
