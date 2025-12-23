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

  async pushAllPagesToAnalyze(auth: CurrentAuth, args: FindUniqueWebsiteArgs) {
    try {
      const pages = await this.sitePages(auth, args);
      const response = await this.seo.analyzeUrls(pages.map((page) => page.url));
      console.log(response.statusText);
      return true;
    } catch (error) {
      this.logger.error(error);
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
