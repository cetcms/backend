import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';
import { MediaModule } from './media/media.module';
import { MemberModule } from './member/member.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [AdminModule, MemberModule, CompanyModule, MediaModule, NotificationModule],
})
export class ModulesModule {}
