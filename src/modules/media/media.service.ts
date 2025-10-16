import { createHash } from 'crypto';
import { createWriteStream, existsSync, mkdirSync, unlinkSync, createReadStream, statSync } from 'fs';
import { extname, join } from 'path';
import { finished } from 'stream/promises';

import { Injectable, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { sanitizeFilename } from 'graphql-upload-ts';
import { CurrentAuth } from 'src/auth/decorators';
import { ConfigService } from 'src/config';
import { Owner } from 'src/generated/graphql';
import { MediaFileRepository, MediaFolderRepository } from 'src/repositories';

import { UploadFileArgs } from './graphql';
import { MediaHelper } from './media.helper';

interface PreviewCacheData {
  path: string;
  mimeType: string;
  size: number;
  mtimeMs: number;
  etag: string;
  fileName: string;
}
interface PreviewCacheEntry {
  data: PreviewCacheData;
  expiresAt: number;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  // 预览缓存：避免相同路径频繁查询数据库
  private readonly previewCache = new Map<string, PreviewCacheEntry>();
  private readonly previewTtlMs = 5 * 60 * 1000; // 5分钟，可根据需要调整

  constructor(
    private readonly helper: MediaHelper,
    private readonly mediaFile: MediaFileRepository,
    private readonly mediaFolder: MediaFolderRepository,
    private readonly configService: ConfigService
  ) {}

  /**
   * 批量获取媒体文件信息
   * @param fileIds
   */
  listMediaFiles(fileIds: string[]) {
    return this.mediaFile.findMany({
      where: { id: { in: fileIds } },
    });
  }

  /**
   * 上传文件
   * @param auth
   * @param args
   */
  async uploadFile(auth: CurrentAuth, args: UploadFileArgs) {
    const { defaultStore, uploadPath } = this.configService.getStorageConfig();
    const resource = await args.file;
    const filename = sanitizeFilename(resource.filename);
    this.helper.validateFile(filename, resource.mimetype);
    const { admin, member, company } = auth;
    const owner = company ? Owner.Company : member ? Owner.Member : Owner.Admin;
    const ownerId = company ? company.id : member?.id || admin?.id;
    if (!owner || !ownerId) {
      throw new Error('Invalid owner');
    }
    const folderPath = this.mediaFolder.normalizePath(args.folderPath);
    const folder = await this.mediaFolder.findOneByPath(owner, ownerId, folderPath).then((f) => {
      if (f) return f;
      return this.mediaFolder.createByPath(owner, ownerId, folderPath);
    });
    if (!folder) {
      throw new Error('Folder not found');
    }

    const uploadDir = join(uploadPath, owner, ownerId, folder.path);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, filename);
    const writeStream = createWriteStream(filePath);
    const readStream = resource.createReadStream();

    try {
      const hash = createHash('sha256');
      let fileSize = 0;

      readStream.on('data', (chunk) => {
        hash.update(chunk);
        fileSize += chunk.length;
      });

      readStream.pipe(writeStream);

      await finished(writeStream);

      const fileHash = hash.digest('hex');
      const extension = extname(filename);
      const mediaType = this.mediaFile.getMediaTypeByMimeType(resource.mimetype);

      // 1. Save the initial record without metadata
      const mediaFile = await this.mediaFile.saveToFolder(owner, ownerId, folder.id, {
        extension,
        fileHash,
        fileSize,
        mediaType,
        store: defaultStore,
        member: member ? { connect: { id: member?.id } } : undefined,
        admin: admin ? { connect: { id: admin?.id } } : undefined,
        mimeType: resource.mimetype,
        fileName: filename,
      });

      // 2. Trigger background processing WITHOUT await
      this.helper.processFileInfo(filePath, mediaType).then((info) => {
        this.mediaFile.update(
          { id: mediaFile.id },
          {
            width: info.width,
            height: info.height,
            duration: info.duration,
            metadata: info.metadata,
          }
        );
      });

      // 3. Return immediately to the client
      return mediaFile;
    } catch (error) {
      // If an error occurs, delete the partially written file
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * 预览文件（高性能版）
   * - 使用内存缓存避免重复数据库查询
   * - 支持 ETag/Last-Modified 条件请求返回 304
   * - 支持 Range 分段传输返回 206
   */
  async previewFile(id: string, fileName: string, req: Request, res: Response) {
    const cacheKey = `${id}:${fileName}`;
    const now = Date.now();

    // 命中缓存
    let cached = this.previewCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      // 校验文件是否仍存在
      if (!existsSync(cached.data.path)) {
        this.previewCache.delete(cacheKey);
        cached = undefined;
      }
    } else if (cached && cached.expiresAt <= now) {
      this.previewCache.delete(cacheKey);
      cached = undefined;
    }

    // 未命中缓存则查库并缓存
    if (!cached) {
      const { uploadPath } = this.configService.getStorageConfig();
      const record = await this.mediaFile.setInclude({ folder: { select: { path: true } } }).findOneById(id);

      if (!record) {
        res.status(404).send('File not found');
        return;
      }
      if (record.fileName !== fileName) {
        res.status(404).send('File name mismatch');
        return;
      }

      const ownerId =
        record.owner === Owner.Admin
          ? record.adminId
          : record.owner === Owner.Member
            ? record.memberId
            : record.companyId;
      if (!ownerId || !record.folder) {
        res.status(404).send('Owner or folder not found');
        return;
      }
      const fullPath = join(uploadPath, record.owner, ownerId, record.folder.path, record.fileName);
      if (!existsSync(fullPath)) {
        res.status(404).send('File content not found');
        return;
      }

      const stat = statSync(fullPath);
      const etag = `${record.fileHash}-${stat.size}`;

      const data: PreviewCacheData = {
        path: fullPath,
        mimeType: record.mimeType,
        size: Number(stat.size),
        mtimeMs: stat.mtimeMs,
        etag,
        fileName: record.fileName,
      };
      cached = { data, expiresAt: now + this.previewTtlMs };
      this.previewCache.set(cacheKey, cached);
    }

    const { data } = cached!;
    const cacheControl = `public, max-age=${Math.floor(this.previewTtlMs / 1000)}`;

    // 条件请求处理（ETag / Last-Modified）
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === data.etag) {
      res.setHeader('ETag', data.etag);
      res.setHeader('Last-Modified', new Date(data.mtimeMs).toUTCString());
      res.setHeader('Cache-Control', cacheControl);
      res.status(304).end();
      return;
    }
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      const since = new Date(ifModifiedSince).getTime();
      if (!Number.isNaN(since) && since >= data.mtimeMs) {
        res.setHeader('ETag', data.etag);
        res.setHeader('Last-Modified', new Date(data.mtimeMs).toUTCString());
        res.setHeader('Cache-Control', cacheControl);
        res.status(304).end();
        return;
      }
    }

    // 通用响应头
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', data.mimeType);
    res.setHeader('ETag', data.etag);
    res.setHeader('Last-Modified', new Date(data.mtimeMs).toUTCString());
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(data.fileName)}"`);

    // Range 分段请求处理
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (match) {
        let start = match[1] ? parseInt(match[1], 10) : 0;
        let end = match[2] ? parseInt(match[2], 10) : data.size - 1;
        if (Number.isNaN(start)) start = 0;
        if (Number.isNaN(end) || end >= data.size) end = data.size - 1;
        if (start > end || start < 0) {
          res.setHeader('Content-Range', `bytes */${data.size}`);
          res.status(416).end();
          return;
        }
        const chunkSize = end - start + 1;
        res.setHeader('Content-Range', `bytes ${start}-${end}/${data.size}`);
        res.setHeader('Content-Length', String(chunkSize));
        res.status(206);
        const fileStream = createReadStream(data.path, { start, end });
        fileStream.pipe(res);
        return;
      }
    }

    // 整文件传输
    res.setHeader('Content-Length', String(data.size));
    const fileStream = createReadStream(data.path);
    fileStream.pipe(res);
  }
}
