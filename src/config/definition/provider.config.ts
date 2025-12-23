import { registerAs } from '@nestjs/config';

export const ProviderConfig = {
  seo: {
    serviceUrl: process.env.SEO_SERVICE_URL || 'http://127.0.0.1:32000',
  },
};

export default registerAs('provider', () => ProviderConfig);
