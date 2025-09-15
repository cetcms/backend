/**
 * 请求头枚举
 *
 * 功能描述：
 * - 定义认证相关的请求头字段
 *
 * 枚举值说明：
 * - Fingerprint: 'x-fingerprint' - 指纹信息
 * - UserAgent: 'user-agent' - 用户代理
 * - Ip: 'x-real-ip' - 真实 IP 地址
 */
export const enum RequestHeaders {
  Fingerprint = 'x-fingerprint',
  UserAgent = 'user-agent',
  Ip = 'x-real-ip',
  Language = 'x-lang',
}
