import { Module } from '@nestjs/common';

import { MediaController } from './media.controller';
import { MediaHelper } from './media.helper';
import { MediaResolver } from './media.resolver';
import { MediaService } from './media.service';

@Module({
  providers: [MediaResolver, MediaService, MediaHelper],
  controllers: [MediaController],
})
export class MediaModule {}
