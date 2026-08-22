/**
 * UsePermission 装饰器
 *
 * 功能描述：
 * - 为控制器/解析器的类或方法声明访问目标（Target[]），并启用 PermissionGuard 进行权限校验。
 * - PermissionGuard 会：
 *   1) 校验是否已登录（存在 member 或 admin）。
 *   2) 若指定了 targets，则要求当前会话的 auth.target 必须包含在 targets 中。
 *   3) 使用 ClassName:MethodName 组装资源标识，并在权限列表中查找是否具备该权限。
 *
 * 参数说明：
 * - clients?: Client[] = []
 *   - 类型：Target 数组（可选），来自 GraphQL 生成的枚举，取值如 Target.Admin、Target.Member。
 *   - 用途：限制允许访问的身份目标；为空数组表示不限定目标，仅进行登录与权限点校验。
 *
 * 返回值说明：
 * - 返回类型：MethodDecorator & ClassDecorator（经由 applyDecorators 返回）
 * - 含义：组合后的装饰器，设置元数据并注册 PermissionGuard。
 *
 * 使用示例：
 * - 限制仅管理员访问：
 *   @UsePermission([Client.Admin])
 *   someAdminQuery() {}
 *
 * - 不限制目标，仅按权限点校验：
 *   @UsePermission()
 *   someCommonQuery() {}
 *
 * 注意事项：
 * - 对应的权限点格式：`PermissionItem.name`，需要与系统权限数据保持一致。
 * - 依赖 USE_PERMISSION_KEY 元数据键与 PermissionGuard，须确保两者在应用中已正确引入与提供。
 */
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { PermissionGuard } from 'src/auth/guards';
import { Client } from 'src/generated/graphql';

export const USE_PERMISSION_KEY = 'usePermission';
export const UsePermission = (clients: Client[] = []) => {
  return applyDecorators(SetMetadata(USE_PERMISSION_KEY, clients), UseGuards(PermissionGuard));
};
