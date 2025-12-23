import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { Logger } from 'src/common';
import { Page } from 'src/providers/site/interfaces';

@Injectable()
export class SiteService {
  private request: AxiosInstance;
  private readonly logger = new Logger(SiteService.name);
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

  async fetchPages() {
    const data = await this.request
      .get('/api/site/pages')
      .then((res) => res.data)
      .catch((err) => {
        this.logger.error(err);
        return {
          locale: 'en',
          total: 0,
          items: [],
        };
      });
    return data as {
      locale: string;
      total: number;
      items: Page[];
    };
  }
}
