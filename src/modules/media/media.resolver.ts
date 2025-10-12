import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/auth/decorators';
import { MediaFile } from 'src/generated/graphql';

import { UploadFileArgs } from './graphql';
import { MediaService } from './media.service';

@Resolver()
export class MediaResolver {
  constructor(private readonly service: MediaService) {}

  @Mutation(() => MediaFile)
  uploadFile(@CurrentAuth() auth: CurrentAuth, @Args() args: UploadFileArgs) {
    return this.service.uploadFile(auth, args);
  }
}
