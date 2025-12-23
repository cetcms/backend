import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

import { AppConfig } from './definition/app.config';
import { ProviderConfig } from './definition/provider.config';
import { StorageConfig } from './definition/storage.config';

@Injectable()
export class ConfigService extends NestConfigService {
  getAppConfig() {
    const appConfig = this.get<typeof AppConfig>('app');
    if (!appConfig) throw new Error('AppConfig is not loaded');
    return appConfig;
  }
  getStorageConfig() {
    const storageConfig = this.get<typeof StorageConfig>('storage');
    if (!storageConfig) throw new Error('StorageConfig is not loaded');
    return storageConfig;
  }
  getProviderConfig() {
    const providerConfig = this.get<typeof ProviderConfig>('provider');
    if (!providerConfig) throw new Error('ProviderConfig is not loaded');
    return providerConfig;
  }
}
