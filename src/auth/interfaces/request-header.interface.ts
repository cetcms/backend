/**
 * 请求头枚举
 *
 * 功能描述：
 * - 定义认证相关的请求头字段
 *
 * 枚举值说明：
 * - Fingerprint: 'X-Fingerprint' - 指纹信息
 * - UserAgent: 'User-Agent' - 用户代理
 * - Language: 'X-Lang' - 请求语言
 */
export const enum RequestHeaders {
  Fingerprint = 'X-Fingerprint',
  UserAgent = 'User-Agent',
  Language = 'X-Lang',
}
