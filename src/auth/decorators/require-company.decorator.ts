/**
 * RequireCompany 装饰器
 *
 * 功能描述：
 * - 为控制器/解析器的类或方法声明需要企业上下文
 * - 用于标记需要当前成员关联企业信息的处理器
 * - 与相应的守卫配合使用，确保请求上下文中包含企业信息
 *
 * 参数说明：
 * - options: RequireCompanyMetadata = [Target.Admin, Target.Member]
 *   - 类型：RequireCompanyMetadata
 *   - 用途：配置选项，指定哪些成员类型需要企业上下文
 *   - Target.Admin：管理员是否需要企业上下文，存在时表示需要
 *   - Target.Member：普通成员是否需要企业上下文，存在时表示需要
 *
 * 返回值说明：
 * - 返回类型：MethodDecorator & ClassDecorator
 * - 含义：设置元数据的装饰器
 *
 * 使用示例：
 * - 仅要求成员必须有关联企业：
 *   @RequireCompany([Target.Member])
 *   someMethod() {}
 *
 * - 仅要求管理员必须有关联企业：
 *   @RequireCompany([Target.Admin])
 *   adminOnlyMethod() {}
 *
 * - 要求管理员和成员都必须有关联企业：
 *   @RequireCompany([Target.Member, Target.Admin])
 *   adminOnlyMethod() {}
 *
 * 注意事项：
 * - 需要在相应的守卫中读取该元数据并进行验证
 * - 与认证装饰器配合使用，确保请求上下文中包含有效的成员信息
 */
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { CompanyGuard } from 'src/auth/guards';
import { Target } from 'src/generated/graphql';

export const REQUIRE_COMPANY_KEY = 'requireCompany';
export const RequireCompany = (targets: Target[] = []) => {
  return applyDecorators(SetMetadata(REQUIRE_COMPANY_KEY, targets), UseGuards(CompanyGuard));
};
