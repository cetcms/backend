import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import type { Cache } from 'cache-manager';
import { Logger } from 'src/common';
import {Page, PagesResponse} from 'src/providers/site/interfaces';

@Injectable()
export class SiteService {
  private request: AxiosInstance;
  private readonly logger = new Logger(SiteService.name);
  private baseUrl: string;
  private token: string;

  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}
  setRequest(url: string, token: string) {
    this.logger.debug('setRequest', url, token);
    this.baseUrl = url;
    this.token = token;
    this.request = this.http.axiosRef.create({
      baseURL: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return this;
  }

  async fetchPages() {
    const cacheKey = `site:pages:${this.baseUrl}`;
    const cached = await this.cacheManager.get<PagesResponse>(cacheKey);
    if (cached) {
      this.logger.debug('从缓存获取站点页面数据');
      return cached;
    }

    const result = await this.request
      .get<PagesResponse>('/api/site/pages')
      .then((res) => res.data)
      .catch((err) => {
        this.logger.error(err);
        return {
          locale: 'en',
          total: 0,
          pages: [],
        } as PagesResponse;
      });
    // 缓存 3 分钟，页面数据可能会变化
    await this.cacheManager.set(cacheKey, result, 3 * 60 * 1000);
    return result;
  }
}
