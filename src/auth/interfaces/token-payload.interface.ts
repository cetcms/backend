import { Client, Target } from 'src/generated/graphql';

/**
 * Token 载荷接口
 *
 * 功能描述：
 * - 定义生成 Token 时所需的载荷信息
 * - 包含目标类型、ID 等关键信息
 *
 * 字段说明：
 * - tokenId: string - Token ID
 * - target: Target - 目标类型（管理员或成员）
 * - targetId: string - 目标 ID（管理员 ID 或成员 ID）
 * - companyId?: string - 公司 ID（可选）
 */
export interface TokenPayload {
  tokenId?: string;
  target: Target;
  client: Client;
  targetId: string;
  companyId?: string;
}
