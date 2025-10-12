import { Injectable } from '@nestjs/common';
import { sanitizeFilename, validateFileExtension, validateMimeType } from 'graphql-upload-ts';
import { CurrentAuth } from 'src/auth/decorators';
import { Owner } from 'src/generated/graphql';
import { MediaFileRepository, MediaFolderRepository } from 'src/repositories';

import { UploadFileArgs } from './graphql';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaFile: MediaFileRepository,
    private readonly mediaFolder: MediaFolderRepository
  ) {}

  /**
   * 上传文件
   * @param auth
   * @param args
   */
  async uploadFile(auth: CurrentAuth, args: UploadFileArgs) {
    const resource = await args.file;
    const filename = sanitizeFilename(resource.filename);
    this.validateFile(filename, resource.mimetype);
    const { admin, user, company } = auth;
    const owner = company ? Owner.Company : user ? Owner.User : Owner.Admin;
    const ownerId = company ? company.id : user?.id || admin?.id;
    if (!owner || !ownerId) {
      throw new Error('Invalid owner');
    }

    const folder = await this.mediaFolder.findOneByPath(owner, ownerId, args.storePath);
    if (!folder) {
      throw new Error('Folder not found');
    }

    // this.mediaFile.saveToFolder(owner, ownerId, folder.id, {
    //   extension: '',
    //   fileHash: '',
    //   fileSize: undefined,
    //   mediaType: undefined,
    //   mimeType: '',
    //   fileName: filename,
    // });
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
