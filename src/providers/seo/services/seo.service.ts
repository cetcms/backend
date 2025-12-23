import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosError } from 'axios';
import { Logger } from 'src/common';
import { ConfigService } from 'src/config';

import {
  AnalyzeResponse,
  StatusResponse,
  GlobalStatusResponse,
  ReportResponse,
} from '../interfaces';

/**
 * SEO 分析服务
 * 提供网页 SEO 分析功能，包括任务提交、状态查询和报告获取
 */
@Injectable()
export class SeoService {
  private request: AxiosInstance;
  private readonly logger = new Logger(SeoService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService
  ) {
    const { seo } = config.getProviderConfig();
    this.request = this.http.axiosRef.create({
      baseURL: seo.serviceUrl,
    });
  }

  /**
   * 提交 SEO 分析任务
   * @param urls URL 数组
   * @returns 分析任务提交响应
   */
  async analyzeUrls(urls: string[]): Promise<AnalyzeResponse> {
    try {
      this.logger.debug(`提交 SEO 分析任务: ${urls.length} 个 URL`);
      const { data } = await this.request.post<AnalyzeResponse>('/seo/analyze', { urls });
      this.logger.info(
        `分析任务已提交: 成功 ${data.submitted} 个, 重复 ${data.duplicateUrls.length} 个, 队列 ${data.queueSize} 个`
      );
      return data;
    } catch (error) {
      this.handleError('提交分析任务失败', error);
    }
  }

  /**
   * 查询指定 URL 的分析状态
   * @param urls 要查询的 URL 数组
   * @returns 状态查询响应
   */
  async getUrlsStatus(urls: string[]): Promise<StatusResponse> {
    try {
      this.logger.debug(`查询 ${urls.length} 个 URL 的分析状态`);
      const { data } = await this.request.post<StatusResponse>('/seo/analyze/status', { urls });
      return data;
    } catch (error) {
      this.handleError('查询 URL 状态失败', error);
    }
  }

  /**
   * 查询全局分析状态
   * @returns 全局状态响应
   */
  async getGlobalStatus(): Promise<GlobalStatusResponse> {
    try {
      this.logger.debug('查询全局分析状态');
      const { data } = await this.request.get<GlobalStatusResponse>('/seo/analyze/status/all');
      return data;
    } catch (error) {
      this.handleError('查询全局状态失败', error);
    }
  }

  /**
   * 获取 SEO 分析报告
   * @param url 要获取报告的 URL
   * @returns 报告响应
   */
  async getReport(url: string): Promise<ReportResponse> {
    try {
      this.logger.debug(`获取 SEO 报告: ${url}`);
      const { data } = await this.request.post<ReportResponse>('/seo/analyze/report', { url });

      if (data.success) {
        this.logger.info(`成功获取 SEO 报告: ${url}, 得分: ${data.data.report?.score}`);
      } else {
        this.logger.warn(`报告不存在或获取失败: ${url}, 原因: ${data.message}`);
      }

      return data;
    } catch (error) {
      this.handleError('获取 SEO 报告失败', error);
    }
  }

  /**
   * 统一错误处理
   * @param message 错误消息前缀
   * @param error 错误对象
   */
  private handleError(message: string, error: unknown): never {
    if (error instanceof Error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // 请求已发出，服务器返回错误状态码
        const status = axiosError.response.status;
        const responseData = axiosError.response.data;
        this.logger.error(
          `${message} - HTTP ${status}: ${JSON.stringify(responseData)}`,
          axiosError.stack
        );
        throw new Error(`${message}: HTTP ${status} - ${JSON.stringify(responseData)}`);
      } else if (axiosError.request) {
        // 请求已发出，但没有收到响应
        this.logger.error(`${message} - 请求超时或无响应`, axiosError.stack);
        throw new Error(`${message}: 请求超时或无响应`);
      } else {
        // 请求配置错误
        this.logger.error(`${message} - ${error.message}`, axiosError.stack);
        throw new Error(`${message}: ${error.message}`);
      }
    }
    // 未知错误类型
    this.logger.error(`${message} - 未知错误: ${String(error)}`);
    throw new Error(`${message}: 未知错误`);
  }
}
