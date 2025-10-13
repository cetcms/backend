import { createHash } from 'crypto';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { finished } from 'stream/promises';

import { Injectable, Logger } from '@nestjs/common';
import { sanitizeFilename } from 'graphql-upload-ts';
import { CurrentAuth } from 'src/auth/decorators';
import { ConfigService } from 'src/config';
import { Owner } from 'src/generated/graphql';
import { MediaFileRepository, MediaFolderRepository } from 'src/repositories';

import { UploadFileArgs } from './graphql';
import { MediaHelper } from './media.helper';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly helper: MediaHelper,
    private readonly mediaFile: MediaFileRepository,
    private readonly mediaFolder: MediaFolderRepository,
    private readonly configService: ConfigService
  ) {}

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
    const { admin, user, company } = auth;
    const owner = company ? Owner.Company : user ? Owner.User : Owner.Admin;
    const ownerId = company ? company.id : user?.id || admin?.id;
    if (!owner || !ownerId) {
      throw new Error('Invalid owner');
    }
    const folderPath = this.mediaFolder.normalizePath(args.folderPath);
    const folder = await this.mediaFolder.findOneByPath(owner, ownerId, folderPath).then((folder) => {
      if (folder) return folder;
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
        user: user ? { connect: { id: user?.id } } : undefined,
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
}
