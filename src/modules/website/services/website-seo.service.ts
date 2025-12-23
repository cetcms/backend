import { Injectable } from '@nestjs/common';
import { CurrentAuth } from 'src/auth/decorators';
import { Logger } from 'src/common';
import { FindUniqueWebsiteArgs, WebsiteCms } from 'src/generated/graphql';
import {
  ContentDataType,
  SeoAnalysisStatus,
  WebsiteSeoPage,
  WebsiteSeoPageStatus,
  WebsiteSeoPageStatusList,
} from 'src/modules/website/graphql';
import { SeoService } from 'src/providers/seo/services';
import { SiteService } from 'src/providers/site/services';
import { StrapiService } from 'src/providers/strapi/services';
import { WebsiteRepository } from 'src/repositories';

@Injectable()
export class WebsiteSeoService {
  private readonly logger = new Logger(WebsiteSeoService.name);
  constructor(
    private readonly seo: SeoService,
    private readonly strapi: StrapiService,
    private readonly site: SiteService,
    private readonly website: WebsiteRepository
  ) {}

  /**
   * 推送所有页面到 SEO 分析队列
   * @param auth 当前认证信息
   * @param args 网站查询参数
   * @returns 是否成功推送
   */
  async pushAllPagesToAnalyze(auth: CurrentAuth, args: FindUniqueWebsiteArgs) {
    try {
      const pages = await this.sitePages(auth, args);
      const urls = pages.map((page) => page.url);

      this.logger.debug(`准备推送 ${urls.length} 个页面到 SEO 分析队列`);
      const response = await this.seo.analyzeUrls(urls);

      if (response.success) {
        this.logger.info(
          `成功推送 ${response.submitted} 个页面, 重复 ${response.duplicateUrls.length} 个, 当前队列 ${response.queueSize} 个`
        );
        return true;
      } else {
        this.logger.warn(`推送失败: ${response.message}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`推送页面到 SEO 分析失败: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 获取网站所有页面的 SEO 分析状态
   * @param auth 当前认证信息
   * @param args 网站查询参数
   * @returns 页面状态列表和摘要信息
   */
  async getWebsiteSeoPageStatus(auth: CurrentAuth, args: FindUniqueWebsiteArgs): Promise<WebsiteSeoPageStatusList> {
    try {
      // 获取所有页面
      const pages = await this.sitePages(auth, args);
      const urls = pages.map((page) => page.url);

      if (urls.length === 0) {
        return {
          pages: [],
          summary: {
            totalAnalyzing: 0,
            queueSize: 0,
            activeTasks: 0,
            maxConcurrent: 5,
          },
        };
      }

      this.logger.debug(`查询 ${urls.length} 个页面的 SEO 分析状态`);

      // 查询所有页面的状态
      const statusResponse = await this.seo.getUrlsStatus(urls);

      // 批量获取报告（只查询已完成的）
      const reportPromises = pages.map(async (page) => {
        try {
          const urlStatus = statusResponse.urlStatuses.find((s) => s.url === page.url);
          if (urlStatus?.status === 'idle') {
            const report = await this.seo.getReport(page.url);
            return {
              url: page.url,
              hasReport: report.success,
              score: report.success ? report.data.report?.score : undefined,
            };
          }
          return { url: page.url, hasReport: false, score: undefined };
        } catch (error) {
          this.logger.warn(`获取报告失败: ${page.url} - ${error.message}`);
          return { url: page.url, hasReport: false, score: undefined };
        }
      });

      const reports = await Promise.all(reportPromises);

      // 组合页面信息和状态信息
      const pageStatuses: WebsiteSeoPageStatus[] = pages.map((page) => {
        const urlStatus = statusResponse.urlStatuses.find((s) => s.url === page.url);
        const report = reports.find((r) => r.url === page.url);

        return {
          id: page.id,
          apiId: page.apiId,
          url: page.url,
          title: page.title,
          status: this.mapStatus(urlStatus?.status || 'idle'),
          md5: urlStatus?.md5 || '',
          score: report?.score,
          hasReport: report?.hasReport || false,
        };
      });

      return {
        pages: pageStatuses,
        summary: {
          totalAnalyzing: statusResponse.summary.totalAnalyzing,
          queueSize: statusResponse.summary.queueSize,
          activeTasks: statusResponse.summary.activeTasks,
          maxConcurrent: statusResponse.summary.maxConcurrent,
        },
      };
    } catch (error) {
      this.logger.error(`获取页面状态失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 映射状态枚举
   * @param status 原始状态
   * @returns GraphQL 状态枚举
   */
  private mapStatus(status: string): SeoAnalysisStatus {
    switch (status) {
      case 'analyzing':
        return SeoAnalysisStatus.Analyzing;
      case 'queued':
        return SeoAnalysisStatus.Queued;
      default:
        return SeoAnalysisStatus.Idle;
    }
  }

  async sitePages(auth: CurrentAuth, args: FindUniqueWebsiteArgs): Promise<WebsiteSeoPage[]> {
    const { where } = args;
    const { company } = auth;
    const website = await this.website.findUnique(where);
    if (!website) {
      throw new Error('网站不存在');
    }
    if (company && company.id !== website.companyId) {
      throw new Error('无权限');
    }
    if (website.cms !== WebsiteCms.Strapi) {
      throw new Error('暂不支持');
    }
    if (!website.cmsApiUrl || !website.cmsApiToken) {
      throw new Error('请配置CMS API');
    }
    const strapi = this.strapi.setRequest(website.cmsApiUrl, website.cmsApiToken);
    const { url } = await strapi.fetchSite().then((site) => site || {});
    const site = this.site.setRequest(url, website.cmsApiToken);
    const { items } = await site.fetchPages();
    return (
      items?.map((item) => ({
        apiId: item.apiId,
        contentType: item.dataType === 'single' ? ContentDataType.Single : ContentDataType.Collection,
        document: item.document,
        documentId: item.documentId,
        documentTitle: item.dataTypeName,
        id: item.id,
        title: item.title,
        url: item.url,
      })) || []
    );
  }
}
