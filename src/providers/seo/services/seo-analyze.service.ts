import crypto from 'crypto';

import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosError } from 'axios';
import type { Cache } from 'cache-manager';
import { Logger } from 'src/common';
import { ConfigService } from 'src/config';

import { AnalyzeResponse, StatusResponse, ReportResponse } from '../interfaces';

function md5(str: string) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

/**
 * SEO 分析服务
 * 提供网页 SEO 分析功能，包括任务提交、状态查询和报告获取
 */
@Injectable()
export class SeoAnalyzeService {
  private request: AxiosInstance;
  private readonly logger = new Logger(SeoAnalyzeService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
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
  async pushUrls(urls: string[]): Promise<AnalyzeResponse> {
    try {
      this.logger.debug(`提交 SEO 分析任务: ${urls.length} 个 URL`);
      const { data } = await this.request.post<AnalyzeResponse>('/seo/analyze', { urls });
      this.logger.info(
        `分析任务已提交: 成功 ${data.submitted || 0} 个, 重复 ${data.duplicateUrls.length} 个, 队列 ${data.queueSize} 个`
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
   * 获取 SEO 分析报告
   * @param url 要获取报告的 URL
   * @returns 报告响应
   */
  async getReport(url: string): Promise<ReportResponse> {
    const cacheKey = `seo:report:${md5(url)}`;
    const cached = await this.cacheManager.get<ReportResponse>(cacheKey);
    if (cached) {
      this.logger.debug(`从缓存获取 SEO 报告: ${url}`);
      return cached;
    }

    try {
      this.logger.debug(`获取 SEO 报告: ${url}`);
      const { data } = await this.request.post<ReportResponse>('/seo/analyze/report', { url });

      if (data.success) {
        this.logger.info(`成功获取 SEO 报告: ${url}, 得分: ${data.data.report?.score}`);
        // 成功的报告缓存更长时间（10分钟）
        await this.cacheManager.set(cacheKey, data, 10 * 60 * 1000);
      } else {
        this.logger.warn(`报告不存在或获取失败: ${url}, 原因: ${data.message}`);
        // 失败的响应缓存较短时间（1分钟）
        await this.cacheManager.set(cacheKey, data, 60 * 1000);
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
        this.logger.error(`${message} - HTTP ${status}: ${JSON.stringify(responseData)}`, axiosError.stack);
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
