import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { ConfigService } from 'src/config';

@Injectable()
export class SeoService {
  private request: AxiosInstance;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService
  ) {
    const { seo } = config.getProviderConfig();
    this.request = this.http.axiosRef.create({
      baseURL: seo.serviceUrl,
    });
  }

  analyzeUrls(urls: string[]) {
    return this.request.post('/seo/analyze', { urls });
  }
}
