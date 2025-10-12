import { createHash } from 'crypto';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { finished } from 'stream/promises';

import { Injectable, Logger } from '@nestjs/common';
import { sanitizeFilename, validateFileExtension, validateMimeType } from 'graphql-upload-ts';
import sharp from 'sharp';
import { CurrentAuth } from 'src/auth/decorators';
import { getMediaInfo } from 'src/common/tools';
import { ConfigService } from 'src/config';
import { MediaType, Owner } from 'src/generated/graphql';
import { MediaFileRepository, MediaFolderRepository } from 'src/repositories';

import { UploadFileArgs } from './graphql';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly mediaFile: MediaFileRepository,
    private readonly mediaFolder: MediaFolderRepository,
    private readonly configService: ConfigService
  ) {}

  /**
   * 上传文件
   * @param auth
   * @param args
   */
  async uploadFile(auth: CurrentAuth, args: UploadFileArgs) {
    const { defaultStore, uploadPath } = this.configService.getStorageConfig();
    const resource = await args.file;
    const filename = sanitizeFilename(resource.filename);
    this.validateFile(filename, resource.mimetype);
    const { admin, user, company } = auth;
    const owner = company ? Owner.Company : user ? Owner.User : Owner.Admin;
    const ownerId = company ? company.id : user?.id || admin?.id;
    if (!owner || !ownerId) {
      throw new Error('Invalid owner');
    }

    const folder = await this.mediaFolder.findOneByPath(owner, ownerId, args.folderPath);
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
      this.processFileInfo(filePath, mediaType).then((info) => {
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
   * Processes and saves metadata in the background.
   * @param filePath The path to the saved file.
   * @param mediaType The type of the media.
   */
  private async processFileInfo(filePath: string, mediaType: MediaType) {
    try {
      let width: number | undefined;
      let height: number | undefined;
      let duration: number | undefined;
      let metadata: object | undefined;

      if (mediaType === MediaType.Image) {
        const imageMetadata = await sharp(filePath).metadata();
        width = imageMetadata.width;
        height = imageMetadata.height;
        metadata = { format: imageMetadata.format, space: imageMetadata.space, channels: imageMetadata.channels };
      } else if (mediaType === MediaType.Video || mediaType === MediaType.Audio) {
        const info = await getMediaInfo(filePath);
        metadata = info;
        duration = info.format.duration;
        if (mediaType === MediaType.Video) {
          const videoStream = info.streams.find((s) => s.codecType === 'video');
          width = videoStream?.width;
          height = videoStream?.height;
        }
      }
      return { metadata, duration, width, height };
      // Update the record in the database
      // Note: You may need to implement the `update` method in your MediaFileRepository
    } catch (error) {
      this.logger.error(`Failed to process metadata for file ${filePath}:`, error);
      // Optional: You could also update the database record to mark it as "processing_failed"
      return {};
    }
  }

  private validateFile(filename: string, mimetype: string) {
    const { extensions, mimeTypes } = this.configService.getStorageConfig();

    const mimeResult = validateMimeType(mimetype, mimeTypes);
    if (!mimeResult.isValid) {
      throw new Error(mimeResult.error);
    }

    // Validate file extension
    const extResult = validateFileExtension(filename, extensions);
    if (!extResult.isValid) {
      throw new Error(extResult.error);
    }
  }
}
