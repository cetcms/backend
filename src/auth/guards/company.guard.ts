/**
 * 权限守卫
 *
 * 功能描述：
 * - 结合 @RequireCompany 装饰器提供的元数据进行权限校验
 * - 校验成员身份和权限点
 * - 支持目标类型限制
 *
 * 核心功能：
 * - canActivate: 权限检查入口
 * - checkPermission: 执行权限检查逻辑
 *
 * 校验逻辑：
 * 1. 是否已登录（存在 member 或 admin）
 * 2. 若声明了 targets，当前会话的 auth.target 必须在 targets 集合内
 * 3. 以 `${ClassName}.${methodName}` 生成权限点，要求出现在权限字符串数组中
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentAuth, REQUIRE_COMPANY_KEY } from 'src/auth/decorators';
import { ContextHandler } from 'src/common/handlers';
import { Target } from 'src/generated/graphql';

@Injectable()
export class CompanyGuard implements CanActivate {
  /**
   * 构造函数
   *
   * 参数说明：
   * - reflector: Reflector - NestJS 反射器
   */
  constructor(private reflector: Reflector) {}

  /**
   * 权限检查入口
   *
   * 功能描述：
   * - 执行权限检查逻辑
   *
   * 参数说明：
   * - context: ExecutionContext - 当前执行上下文
   *
   * 返回值说明：
   * - boolean - 是否允许访问
   */
  canActivate(context: ExecutionContext): boolean {
    return this.checkRequire(context);
  }

  /**
   * 执行权限检查逻辑
   *
   * 功能描述：
   * - 检查成员是否具有访问权限
   * - 验证目标类型和权限点
   *
   * 参数说明：
   * - context: ExecutionContext - 当前执行上下文
   *
   * 返回值说明：
   * - boolean - 是否具有权限
   */
  private checkRequire(context: ExecutionContext): boolean {
    const targets = this.reflector.getAllAndOverride<Target[]>(REQUIRE_COMPANY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = ContextHandler(context).getRequest();
    const auth = <CurrentAuth>request.authInfo;

    // 检查是否必须登录企业才允许访问
    if (targets && targets.includes(auth.target as Target) && !auth.companyId) {
      return false;
    }

    return Boolean(auth);
  }
}
