import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';
import { CompanyRoleModule } from './company-role/company-role.module';
import { CompanyUserModule } from './company-user/company-user.module';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AdminModule, UserModule, CompanyModule, CompanyRoleModule, CompanyUserModule, MediaModule],
})
export class ModulesModule {}
