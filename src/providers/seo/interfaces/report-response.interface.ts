/**
 * SEO 报告数据
 */
export interface SeoReport {
  score: number;
  [key: string]: any;
}

/**
 * 报告状态
 */
export type ReportStatus = 'completed' | 'failed';

/**
 * 报告数据
 */
export interface ReportData {
  url: string;
  md5: string;
  timestamp: string;
  status: ReportStatus;
  report?: SeoReport;
  error?: string;
}

/**
 * 获取报告响应（成功）
 */
export interface ReportSuccessResponse {
  success: true;
  data: ReportData;
}

/**
 * 获取报告响应（失败）
 */
export interface ReportFailureResponse {
  success: false;
  message: string;
  url: string;
  md5: string;
  error?: string;
}

/**
 * 获取报告响应
 */
export type ReportResponse = ReportSuccessResponse | ReportFailureResponse;
