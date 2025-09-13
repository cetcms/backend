import { Module } from '@nestjs/common';

import { MediaController } from './media.controller';
import { MediaResolver } from './media.resolver';
import { MediaService } from './media.service';

@Module({
  providers: [MediaResolver, MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
