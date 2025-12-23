import { Injectable } from '@nestjs/common';
import { CurrentAuth } from 'src/auth/decorators';
import { Logger } from 'src/common';
import { FindUniqueWebsiteArgs, WebsiteCms } from 'src/generated/graphql';
import { ContentDataType, WebsiteSeoPage } from 'src/modules/website/graphql';
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
