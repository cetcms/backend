import { Injectable, Logger } from '@nestjs/common';
import { validateFileExtension, validateMimeType } from 'graphql-upload-ts';
import sharp from 'sharp';
import { getMediaInfo } from 'src/common';
import { ConfigService } from 'src/config';
import { MediaType } from 'src/generated/graphql';

@Injectable()
export class MediaHelper {
  private readonly logger = new Logger(MediaHelper.name);
  constructor(private readonly configService: ConfigService) {}

  /**
   * Processes and saves metadata in the background.
   * @param filePath The path to the saved file.
   * @param mediaType The type of the media.
   */
  async processFileInfo(filePath: string, mediaType: MediaType) {
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

  validateFile(filename: string, mimetype: string) {
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
