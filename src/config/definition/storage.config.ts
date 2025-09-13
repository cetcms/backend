import path from 'node:path';

import { registerAs } from '@nestjs/config';
import { MediaStore } from 'src/generated/graphql/prisma';

export const StorageConfig = {
  defaultStore: MediaStore.Local,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  uploadPath: path.resolve('upload'),
  baseUrl: 'http://localhost:3000/media',
  local: {
    baseUrl: 'http://localhost:3000/media/local',
  },
  oss: {
    baseUrl: 'https://oss.youyushe.com',
  },
  cos: {
    baseUrl: 'https://cos.youyushe.com',
  },
  s3: {
    baseUrl: 'https://s3.bucket',
  },
};

export default registerAs('storage', () => StorageConfig);
