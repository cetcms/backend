import { Injectable } from '@nestjs/common';
import { sanitizeFilename, validateFileExtension, validateMimeType } from 'graphql-upload-ts';

import { UploadFileArgs } from './graphql';

@Injectable()
export class MediaService {
  /**
   * 上传文件
   * @param args
   */
  async uploadFile(args: UploadFileArgs) {
    const resource = await args.file;
    const filename = sanitizeFilename(resource.filename);

    this.validateFile(filename, resource.mimetype);
  }

  validateFile(filename: string, mimetype: string) {
    const mimeResult = validateMimeType(mimetype, ['image/jpeg', 'image/png']);
    if (!mimeResult.isValid) {
      throw new Error(mimeResult.error);
    }

    // Validate file extension
    const extResult = validateFileExtension(filename, ['.jpg', '.jpeg', '.png']);
    if (!extResult.isValid) {
      throw new Error(extResult.error);
    }
  }
}
