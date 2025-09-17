/**
 * RequireCompany 装饰器
 *
 * 功能描述：
 * - 为控制器/解析器的类或方法声明需要公司上下文
 * - 用于标记需要当前用户关联公司信息的处理器
 * - 与相应的守卫配合使用，确保请求上下文中包含公司信息
 *
 * 参数说明：
 * - options: RequireCompanyMetadata = { admin: true, user: true }
 *   - 类型：RequireCompanyMetadata
 *   - 用途：配置选项，指定哪些用户类型需要公司上下文
 *   - admin：管理员是否需要公司上下文，默认为 true
 *   - user：普通用户是否需要公司上下文，默认为 true
 *
 * 返回值说明：
 * - 返回类型：MethodDecorator & ClassDecorator
 * - 含义：设置元数据的装饰器
 *
 * 使用示例：
 * - 要求所有用户类型都必须有关联公司：
 *   @RequireCompany()
 *   someMethod() {}
 *
 * - 仅要求管理员必须有关联公司：
 *   @RequireCompany({ admin: true, user: false })
 *   adminOnlyMethod() {}
 *
 * 注意事项：
 * - 需要在相应的守卫中读取该元数据并进行验证
 * - 与认证装饰器配合使用，确保请求上下文中包含有效的用户信息
 */
import { SetMetadata } from '@nestjs/common';

export interface RequireCompanyMetadata {
  admin?: boolean;
  user?: boolean;
}
export const REQUIRE_COMPANY_KEY = 'isPublicAccess';
export const RequireCompany = (options: RequireCompanyMetadata = { admin: true, user: true }) => {
  return SetMetadata(REQUIRE_COMPANY_KEY, options);
};
