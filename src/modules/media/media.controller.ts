import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors, Req, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from 'src/auth/guards';

import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }

  @Get('/:id/:fileName')
  previewFile(@Param('id') id: string, @Param('fileName') fileName: string, @Req() req: Request, @Res() res: Response) {
    this.service.previewFile(id, fileName, req, res);
  }
}
