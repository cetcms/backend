import { Module } from '@nestjs/common';

import { CompanyManagementResolver } from './company-management.resolver';
import { CompanyManagementService } from './company-management.service';
import { CompanyResolver } from './company.resolver';
import { CompanyService } from './company.service';

@Module({
  providers: [CompanyResolver, CompanyService, CompanyManagementService, CompanyManagementResolver],
  exports: [CompanyService, CompanyManagementService],
})
export class CompanyModule {}
