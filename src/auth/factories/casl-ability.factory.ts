import { AbilityBuilder, createMongoAbility } from '@casl/ability';

/**
 * CASL 能力工厂
 *
 * 功能描述：
 * - 基于 CASL 库创建用户权限能力
 * - 根据权限列表构建用户能力对象
 *
 * 核心功能：
 * - build: 根据权限列表构建能力对象
 */
export class CaslAbilityFactory {
  /**
   * 构建用户能力对象
   *
   * 功能描述：
   * - 根据权限列表创建 CASL 能力对象
   * - 支持 MongoDB 风格的权限定义
   *
   * 参数说明：
   * - permissions: Array<{ subject: string; action: string }> - 权限列表
   *   - subject: string - 资源主题
   *   - action: string - 操作动作
   *
   * 返回值说明：
   * - CASL 能力对象
   */
  build(permissions: Array<{ subject: string; action: string }>) {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    permissions.forEach((permission) => {
      can(permission.action, permission.subject);
    });
    return build();
  }
}
