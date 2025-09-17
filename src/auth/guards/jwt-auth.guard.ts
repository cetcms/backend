import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_ACCESS_KEY, REQUIRE_COMPANY_KEY, RequireCompany, RequireCompanyMetadata } from 'src/auth/decorators';
import { ContextHandler, RequestHandler } from 'src/common/handlers';
import { Admin } from 'src/generated/graphql/admin';
import { Auth } from 'src/generated/graphql/auth';
import { User } from 'src/generated/graphql/user';

/**
 * JWT 认证守卫
 *
 * 功能描述：
 * - 基于 Passport JWT 的认证守卫
 * - 支持公共访问标记跳过认证
 * - 兼容 GraphQL 和 REST 环境
 * - 验证指纹信息确保安全性
 *
 * 核心功能：
 * - canActivate: 决定是否需要执行认证流程
 * - getRequest: 获取请求对象
 * - handleRequest: 处理认证结果与错误
 *
 * 依赖组件：
 * - IS_PUBLIC_ACCESS_KEY: 公共访问标记键
 * - Reflector: 反射器用于读取元数据
 * - ContextHandler: 请求处理器用于适配不同环境
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * 构造函数
   *
   * 参数说明：
   * - reflector: Reflector - NestJS 反射器
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 决定是否需要执行认证流程
   *
   * 功能描述：
   * - 若处理器/控制器已标记为公共访问则跳过认证
   *
   * 参数说明：
   * - context: ExecutionContext - 当前执行上下文
   *
   * 返回值说明：
   * - boolean - 是否需要执行认证流程
   */
  canActivate(context: ExecutionContext) {
    if (this.isPublicAccess(context)) {
      return true;
    }
    return super.canActivate(context);
  }

  /**
   * 从 ExecutionContext 提取请求对象
   *
   * 功能描述：
   * - 适配 GraphQL 和 REST 环境获取请求对象
   *
   * 参数说明：
   * - context: ExecutionContext - 当前执行上下文
   *
   * 返回值说明：
   * - any - Express Request 或兼容的请求对象
   */
  getRequest(context: ExecutionContext): any {
    return ContextHandler(context).getRequest();
  }

  /**
   * 处理认证结果与错误
   *
   * 功能描述：
   * - 当 user 或 auth 缺失时抛出 401（TOKEN_INVALID）
   * - 校验请求头 Fingerprint 是否与 auth.fingerprint 一致
   * - 认证通过后返回 [user, auth]
   *
   * 参数说明：
   * - error: Error - 来自底层认证策略的错误
   * - user: Admin | User - 认证通过的用户（Admin | User）
   * - auth: Auth - GraphQL Auth 实体，包含指纹等信息
   * - context: ExecutionContext - 当前执行上下文
   *
   * 返回值说明：
   * - any - 认证结果 [user, auth]
   */
  handleRequest(error: Error, user: Admin | User, auth: Auth, context: ExecutionContext): any {
    if (!auth || !user) {
      throw new UnauthorizedException({
        message: error?.message || 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }
    const req = ContextHandler(context).getRequest();
    if (RequestHandler(req).getFingerprint() !== auth.fingerprint) {
      throw new UnauthorizedException({
        message: 'Invalid fingerprint',
        code: 'FINGERPRINT_INVALID',
      });
    }

    const metadata = this.getRequireCompanyMetadata(context);
    if (metadata.admin && (!auth.admin || !auth.companyId)) {
      throw new UnauthorizedException({
        message: 'Invalid company',
        code: 'COMPANY_INVALID',
      });
    }
    if (metadata.user && (!auth.user || !auth.companyId)) {
      throw new UnauthorizedException({
        message: 'Invalid company',
        code: 'COMPANY_INVALID',
      });
    }

    return user;
  }

  /**
   * 判断处理器/控制器是否被标记为公共访问
   *
   * 功能描述：
   * - 检查类或方法是否被标记为公共访问
   *
   * 参数说明：
   * - context: ExecutionContext - 当前执行上下文
   *
   * 返回值说明：
   * - boolean - 是否为公共访问
   */
  private isPublicAccess(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ACCESS_KEY, [context.getHandler(), context.getClass()]);
  }

  /**
   * 获取处理器/控制器的 requireCompany 元数据
   *
   * 功能描述：
   * - 获取类或方法上的 requireCompany 元数据
   *
   * 参数说明：
   * - context: ExecutionContext - 当前执行上下文
   *
   * 返回值说明：
   * - RequireCompanyMetadata - requireCompany 元数据
   */
  private getRequireCompanyMetadata(context: ExecutionContext): RequireCompanyMetadata {
    return this.reflector.getAllAndOverride<RequireCompanyMetadata>(REQUIRE_COMPANY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
