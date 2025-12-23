import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { Logger } from 'src/common';

import { ContentType, Locale, Site } from '../interfaces';

@Injectable()
export class StrapiService {
  private request: AxiosInstance;
  private readonly logger = new Logger(StrapiService.name);
  constructor(private readonly http: HttpService) {}
  setRequest(url: string, token: string) {
    this.logger.debug('setRequest', url, token);
    this.request = this.http.axiosRef.create({
      baseURL: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return this;
  }
  async fetchTypes() {
    const { data } = await this.request.get('/api/content-type-builder/content-types').then((res) => res.data);
    return data as Array<ContentType>;
  }

  async fetchLocales() {
    const data = await this.request.get('/api/i18n/locales').then((res) => res.data);
    console.log(data);
    return data as Array<Locale>;
  }

  async fetchSite() {
    const { data } = await this.request.get('/api/site').then((res) => res.data);
    return data as Site;
  }
}
