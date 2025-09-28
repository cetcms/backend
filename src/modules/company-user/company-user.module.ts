import { Module } from '@nestjs/common';

import { CompanyUserResolver } from './company-user.resolver';
import { CompanyUserService } from './company-user.service';

@Module({
  providers: [CompanyUserResolver, CompanyUserService],
})
export class CompanyUserModule {}
