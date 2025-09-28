import { Module } from '@nestjs/common';

import { UserManagementResolver } from './user-management.resolver';
import { UserManagementService } from './user-management.service';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  providers: [UserResolver, UserService, UserManagementService, UserManagementResolver],
  exports: [UserService, UserManagementService],
})
export class UserModule {}
