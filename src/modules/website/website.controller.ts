import { Controller, Get } from '@nestjs/common';

import { WebsiteSeoService } from './services';

@Controller('website')
export class WebsiteController {
  constructor(private readonly service: WebsiteSeoService) {}
  @Get('types')
  getTypes() {
    return [];
  }
}
