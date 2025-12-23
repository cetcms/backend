/**
 * SEO 分析提交响应
 */
export interface AnalyzeResponse {
  success: boolean;
  message: string;
  submitted: number;
  duplicateUrls: string[];
  queueSize: number;
  activeTasks: number;
  maxConcurrent: number;
}
