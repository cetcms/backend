/**
 * JWT 载荷接口
 *
 * 功能描述：
 * - 定义 JWT Token 的载荷结构
 * - 包含标准 JWT 字段和自定义字段
 *
 * 字段说明：
 * - iss?: string - 签发者
 * - sub?: string - 主题（成员 ID）
 * - aud?: string | string[] - 接收者（目标类型）
 * - exp?: number - 过期时间戳
 * - nbf?: number - 生效时间戳
 * - iat?: number - 签发时间戳
 * - jti?: string - JWT ID（Token ID）
 * - cid?: string - 公司 ID
 */
export interface JwtPayload {
  [key: string]: any;
  iss?: string | undefined;
  sub?: string | undefined;
  aud?: string | string[] | undefined;
  exp?: number | undefined;
  nbf?: number | undefined;
  iat?: number | undefined;
  jti?: string | undefined;
  cid?: string | undefined;
}
