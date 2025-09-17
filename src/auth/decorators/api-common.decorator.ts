/**
 * ApiCommon 装饰器
 *
 * 功能描述：
 * - 为控制器或解析器统一添加常用的 API 文档装饰器
 * - 默认添加指纹和语言头部信息的文档说明
 * - 可选择性添加认证头部信息
 *
 * 参数说明：
 * - options: { auth?: boolean } = { auth: true }
 *   - 类型：对象
 *   - 用途：配置选项
 *   - auth：是否添加认证头部文档，默认为 true
 *
 * 返回值说明：
 * - 返回类型：MethodDecorator & ClassDecorator
 * - 含义：组合装饰器，包含 ApiHeader 和可选的 ApiBearerAuth
 *
 * 使用示例：
 * - 添加完整头部信息（包括认证）：
 *   @ApiCommon()
 *   someMethod() {}
 *
 * - 仅添加通用头部信息（不包括认证）：
 *   @ApiCommon({ auth: false })
 *   publicMethod() {}
 *
 * 注意事项：
 * - 该装饰器主要用于统一 API 文档的头部信息描述
 * - 不提供实际的认证逻辑，仅用于 Swagger 文档生成
 */
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RequestHeaders } from 'src/auth/interfaces';

export function ApiCommon({ auth }: { auth?: boolean } = { auth: true }) {
  const headers = [
    ApiHeader({
      name: RequestHeaders.Fingerprint,
      description: '客户端请求指纹',
    }),
    ApiHeader({
      name: RequestHeaders.Language,
      description: '客户端语言标识',
    }),
  ];
  if (auth) {
    headers.push(ApiBearerAuth());
  }
  return applyDecorators(...headers);
}
