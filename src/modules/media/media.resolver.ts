import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { MediaFile } from 'src/generated/graphql';

import { UploadFileArgs } from './graphql';
import { MediaService } from './media.service';

/**
 * 媒体管理
 * @group Media
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class MediaResolver {
  constructor(private readonly service: MediaService) {}

  /**
   * 根据 ID 列出文件
   * @param fileIds
   */
  @Query(() => [MediaFile])
  listMediaFiles(@Args('fileIds', { type: () => [String] }) fileIds: string[]) {
    return this.service.listMediaFiles(fileIds);
  }

  /**
   * 文件上传
   * @param auth
   * @param args
   */
  @Mutation(() => MediaFile)
  uploadFile(@CurrentAuth() auth: CurrentAuth, @Args() args: UploadFileArgs) {
    return this.service.uploadFile(auth, args);
  }
}
