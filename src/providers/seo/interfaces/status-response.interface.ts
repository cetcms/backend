/**
 * URL 状态类型
 */
export type UrlStatus = 'analyzing' | 'queued' | 'idle';

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
  totalAnalyzing: number;
  queueSize: number;
  activeTasks: number;
  maxConcurrent: number;
}

/**
 * 查询状态响应
 */
export interface StatusResponse {
  urlStatuses: UrlStatusInfo[];
  summary: StatusSummary;
}

/**
 * 全局状态响应
 */
export interface GlobalStatusResponse {
  analyzingUrls: string[];
  queueSize: number;
  activeTasks: number;
  maxConcurrent: number;
}
