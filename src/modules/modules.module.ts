import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';
import { MediaModule } from './media/media.module';
import { MemberModule } from './member/member.module';
import { NotificationModule } from './notification/notification.module';
import { WebsiteModule } from './website/website.module';

@Module({
  imports: [AdminModule, MemberModule, CompanyModule, MediaModule, NotificationModule, WebsiteModule],
})
export class ModulesModule {}
