import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosError } from 'axios';
import type { Cache } from 'cache-manager';
import { Logger } from 'src/common';
import { ConfigService } from 'src/config';
import { Website } from 'src/generated/graphql';

import { AnalyzeResponse } from '../interfaces';

/**
 * SEO 分析服务
 * 提供网页 SEO 分析功能，包括任务提交、状态查询和报告获取
 */
@Injectable()
export class SeoGenerateService {
  private request: AxiosInstance;
  private readonly logger = new Logger(SeoGenerateService.name);

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
   * 提交 SEO 更新任务
   * @returns 分析任务提交响应
   * @param cmsUrl
   * @param cmsToken
   * @param pages
   * @param website
   * @param cmsType
   */
  async pushPages(
    cmsUrl: string,
    cmsToken: string,
    pages: Array<{ url: string; document: string; documentId: string; locale: string }>,
    website: Website,
    cmsType = 'strapi'
  ): Promise<AnalyzeResponse> {
    try {
      this.logger.debug(`提交 SEO 更新任务: ${pages.length} 个 URL`);
      const { data } = await this.request.post<AnalyzeResponse>(`/seo/${cmsType}/pages/update`, {
        cmsUrl,
        cmsToken,
        pages,
        industryBackground: website?.industryBackground,
      });
      this.logger.info(
        `任务已提交: 成功 ${data.submitted || 0} 个, 重复 ${data.duplicateUrls.length} 个, 队列 ${data.queueSize} 个`
      );
      return data;
    } catch (error) {
      this.handleError('提交任务失败', error);
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
