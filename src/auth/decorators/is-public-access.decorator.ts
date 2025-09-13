/**
 * IsPublicAccess 装饰器
 *
 * 功能描述：
 * - 将处理器/控制器标记为"公共访问"，即跳过鉴权流程（具体由应用中相应的守卫依据 IS_PUBLIC_ACCESS_KEY 判断实现）。
 *
 * 常量说明：
 * - IS_PUBLIC_ACCESS_KEY: string
 *   - 用途：元数据键，供守卫通过 Reflector 读取。
 *
 * 使用示例：
 * - 用于 GraphQL 或 REST 控制器/处理器：
 *   @IsPublicAccess()
 *   @Query(() => String)
 *   health() { return 'ok'; }
 *
 * 注意事项：
 * - 需要在全局或局部守卫中显式读取该元数据并相应跳过鉴权。
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_ACCESS_KEY = 'isPublicAccess';
export const IsPublicAccess = () => SetMetadata(IS_PUBLIC_ACCESS_KEY, true);
