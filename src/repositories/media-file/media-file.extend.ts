import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ConfigService } from 'src/config';
import { MediaFile } from 'src/generated/graphql';

@Resolver(MediaFile)
export class MediaFileExtend {
  constructor(private readonly config: ConfigService) {}

  @ResolveField(() => String)
  fileSize(@Parent() mediaFile: MediaFile) {
    return mediaFile.fileSize.toString();
  }

  @ResolveField(() => String)
  url(@Parent() mediaFile: MediaFile) {
    const { baseUrl } = this.config.getStorageConfig();
    return `${baseUrl}/${mediaFile.id}/${mediaFile.fileName}`;
  }
}
