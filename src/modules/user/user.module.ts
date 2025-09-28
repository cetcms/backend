import { Module } from '@nestjs/common';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserManagementService } from './user-management.service';
import { UserManagementResolver } from './user-management.resolver';

@Module({
  providers: [
    UserResolver, 
    UserService, 
    UserManagementService, 
    UserManagementResolver,
  ],
  exports: [UserService, UserManagementService],
})
export class UserModule {}
