/**
 * URL 状态类型
 */
export type UrlStatus = 'analyzing' | 'queued' | 'completed' | 'failed' | 'timeout' | 'none';

/**
 * URL 状态信息
 */
export interface UrlStatusInfo {
  url: string;
  status: UrlStatus;
  md5: string;
}

/**
 * 状态摘要信息
 */
export interface StatusSummary {
  queued: number;
  analyzing: number;
  completed: number;
  failed: number;
  timeout: number;
  notFound: number;
}

/**
 * 查询状态响应
 */
export type StatusResponse = UrlStatusInfo[];
