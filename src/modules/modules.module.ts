import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';
import { MediaModule } from './media/media.module';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AdminModule, UserModule, CompanyModule, MediaModule, NotificationModule],
})
export class ModulesModule {}
