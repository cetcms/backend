import path from 'node:path';

import { registerAs } from '@nestjs/config';

import { MediaStore } from 'src/generated/graphql/prisma';

export const StorageConfig = {
  defaultStore: MediaStore.Local,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  uploadPath: path.resolve('uploads'),
  baseUrl: 'http://localhost:3000/media',

  mimeTypes: [
    // 图片格式
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/bmp',
    'image/heic',
    'image/heif',
    'image/avif',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    // 视频格式
    'video/mp4',
    'video/webm',
    // 音频格式
    'audio/mpeg',
    'audio/wav',
    // 文档格式
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/wps-office.wps',
    'application/wps-office.et',
    'application/wps-office.dps',
    'application/wps-office.wpt',
    'application/wps-office.ett',
    'application/wps-office.dpt',
    // 压缩包格式
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-bzip2',
  ],
  extensions: [
    // 图片扩展名
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'svg',
    'tiff',
    'tif',
    'bmp',
    'heic',
    'heif',
    'avif',
    'ico',
    // 视频扩展名
    'mp4',
    'webm',
    // 音频扩展名
    'mp3',
    'wav',
    // 文档扩展名
    'txt',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'wps',
    'et',
    'dps',
    'wpt',
    'ett',
    'dpt',
    // 压缩包扩展名
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'bz2',
  ],
};

export default registerAs('storage', () => StorageConfig);
