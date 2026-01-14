import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import type { Cache } from 'cache-manager';
import { Logger } from 'src/common';

import { ContentType, Locale, Site } from '../interfaces';

@Injectable()
export class StrapiService {
  private request: AxiosInstance;
  private readonly logger = new Logger(StrapiService.name);
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

  async fetchTypes() {
    const cacheKey = `strapi:types:${this.baseUrl}`;
    const cached = await this.cacheManager.get<Array<ContentType>>(cacheKey);
    if (cached) {
      this.logger.debug('从缓存获取 Strapi ContentTypes');
      return cached;
    }

    const { data } = await this.request.get('/api/content-type-builder/content-types').then((res) => res.data);
    const types = data as Array<ContentType>;
    await this.cacheManager.set(cacheKey, types, 5 * 60 * 1000); // 缓存 5 分钟
    return types;
  }

  async fetchLocales() {
    const cacheKey = `strapi:locales:${this.baseUrl}`;
    const cached = await this.cacheManager.get<Array<Locale>>(cacheKey);
    if (cached) {
      this.logger.debug('从缓存获取 Strapi Locales');
      return cached;
    }

    const data = await this.request.get('/api/i18n/locales').then((res) => res.data);
    console.log(data);
    const locales = data as Array<Locale>;
    await this.cacheManager.set(cacheKey, locales, 10 * 60 * 1000); // 缓存 10 分钟
    return locales;
  }

  async fetchSite() {
    const cacheKey = `strapi:site:${this.baseUrl}`;
    const cached = await this.cacheManager.get<Site>(cacheKey);
    if (cached) {
      this.logger.debug('从缓存获取 Strapi Site');
      return cached;
    }

    const { data } = await this.request.get('/api/site').then((res) => res.data);
    const site = data as Site;
    await this.cacheManager.set(cacheKey, site, 5 * 60 * 1000); // 缓存 5 分钟
    return site;
  }
}
