/**
 * 工厂模块导出聚合文件
 *
 * 功能描述：
 * - 统一导出 factories 目录下的所有工厂类
 * - 便于在业务模块中通过统一入口导入
 *
 * 导出内容：
 * - TokenFactory: Token 工厂
 * - CaslAbilityFactory: CASL 能力工厂
 */
export * from './token.factory';
export * from './casl-ability.factory';
