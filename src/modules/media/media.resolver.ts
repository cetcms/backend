import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { MediaFile } from 'src/generated/graphql';

import { UploadFileArgs } from './graphql';
import { MediaService } from './media.service';

@Resolver()
export class MediaResolver {
  constructor(private readonly service: MediaService) {}

  @Mutation(() => MediaFile)
  uploadFile(@Args() args: UploadFileArgs) {
    return this.service.uploadFile(args);
  }
}
