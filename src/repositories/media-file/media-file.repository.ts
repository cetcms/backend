import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { FindManyMediaFileArgs, MediaType, Owner, UpsertOneMediaFileArgs } from 'src/generated/graphql';

import { MediaFileAbstract } from './media-file.abstract';

/**
 * 媒体文件数据访问仓库类
 *
 * 继承自MediaFileAbstract抽象类，实现了媒体文件数据的具体访问方法
 */

@Injectable()
export class MediaFileRepository extends MediaFileAbstract {
  /**
   * 构造函数
   *
   * @param db - 数据库服务实例，用于执行数据库操作
   */
  constructor(protected readonly db: DatabaseService) {
    super(db);
  }

  /**
   * 处理解析后的数据
   *
   * 实现抽象方法，主要用于处理解析后的数据
   *
   * @param input - 输入的创建或更新数据
   * @returns 处理后的数据
   */
  protected handleParsedData<T extends Prisma.MediaFileCreateInput | Prisma.MediaFileUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存媒体文件记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的媒体文件记录
   */
  save(where: UpsertOneMediaFileArgs['where'], data: UpsertOneMediaFileArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 在指定文件信息到媒体文件夹
   * @param owner
   * @param ownerId
   * @param folderId
   * @param input
   */
  saveToFolder(
    owner: Owner,
    ownerId: string,
    folderId: string,
    input: Omit<UpsertOneMediaFileArgs['create'], 'folder' | 'owner' | 'company'>
  ) {
    const data: UpsertOneMediaFileArgs['create'] = {
      ...input,
      folder: { connect: { id: folderId } },
      owner,
    };
    switch (owner) {
      case Owner.Admin:
        data.admin = { connect: { id: ownerId } };
        delete data.member;
        delete data.company;
        return this.save(
          {
            adminFileIdx: {
              folderId,
              adminId: ownerId,
              fileName: data.fileName,
            },
          },
          data
        );
      case Owner.Member:
        data.member = { connect: { id: ownerId } };
        delete data.admin;
        delete data.company;
        return this.save(
          {
            memberFileIdx: {
              folderId,
              memberId: ownerId,
              fileName: data.fileName,
            },
          },
          data
        );
      case Owner.Company:
        data.company = { connect: { id: ownerId } };
        if (data.member) delete data.admin;
        if (data.admin) delete data.member;
        return this.save(
          {
            companyFileIdx: {
              folderId,
              companyId: ownerId,
              fileName: data.fileName,
            },
          },
          data
        );
      default:
        throw new Error('Invalid owner');
    }
  }

  /**
   * 根据ID查找媒体文件
   *
   * @param id - 媒体文件ID
   * @returns 查询到的媒体文件信息
   */
  findOneById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据文件夹ID查找媒体文件
   *
   * @param folderId - 文件夹ID
   * @returns 查询到的媒体文件列表
   */
  findByFolderId(folderId: string) {
    return this.findMany({
      where: {
        folderId: {
          equals: folderId,
        },
      },
    });
  }

  /**
   * 查询多个媒体文件并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyMediaFileArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }

  /**
   * 获取媒体文件的类型
   *
   * @param mimeType - 媒体文件的MIME类型
   * @returns 媒体文件的类型
   */
  getMediaTypeByMimeType(mimeType: string) {
    const archiveTypes = [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-bzip2',
      'application/x-lzip',
      'application/x-xz',
    ];
    const documentMimeTypes = [
      // Microsoft Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-word.document.macroEnabled.12',

      // Microsoft Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template',

      // Microsoft PowerPoint
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow',

      // Microsoft Visio
      'application/vnd.visio',
      'application/vnd.visio2013',
      'application/vnd.ms-visio.drawing',
      'application/vnd.ms-visio.template',

      // Microsoft Project
      'application/vnd.ms-project',

      // Microsoft Access
      'application/vnd.ms-access',

      // Microsoft Publisher
      'application/x-mspublisher',

      // WPS Office
      'application/wps-office.wps',
      'application/vnd.ms-wpl',
      'application/wps-office.et',
      'application/vnd.ms-ets',
      'application/wps-office.dps',
      'application/vnd.ms-dps',
      'application/wps-office.pdf',

      // PDF
      'application/pdf',
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',

      // 电子书
      'application/epub+zip',
      'application/x-mobipocket-ebook',
      'application/vnd.amazon.ebook',

      // 流程图
      'application/vnd.jgraph.mxfile',
      'application/vnd.gliffy+json',
      'application/vnd.omni-graffle',
      'application/x-dia-diagram',
      'application/vnd.graphml+json',
      'application/graphml+xml',

      // 脑图
      'application/vnd.xmind.workbook',
      'application/x-xmind',
      'application/x-freemind',
      'application/vnd.freemind',
      'application/vnd.mindjet.mindmanager',
      'application/x-mindmanager',
      'application/vnd.mindnode',
      'application/vnd.simplemind',
      'application/x-opml+xml',

      // 文本和标记
      'text/plain',
      'text/markdown',
      'text/x-markdown',
      'text/rtf',
      'application/rtf',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
      'text/xml',
    ];
    let mediaType: MediaType = MediaType.Other;
    if (mimeType.startsWith('image/')) {
      mediaType = MediaType.Image;
    } else if (mimeType.startsWith('video/')) {
      mediaType = MediaType.Video;
    } else if (mimeType.startsWith('audio/')) {
      mediaType = MediaType.Audio;
    } else if (documentMimeTypes.includes(mimeType)) {
      mediaType = MediaType.Document;
    } else if (archiveTypes.includes(mimeType)) {
      mediaType = MediaType.Archive;
    }
    return mediaType;
  }
}
