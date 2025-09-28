import { Module } from '@nestjs/common';

import { CompanyRoleResolver } from './company-role.resolver';
import { CompanyRoleService } from './company-role.service';

@Module({
  providers: [CompanyRoleResolver, CompanyRoleService],
})
export class CompanyRoleModule {}
