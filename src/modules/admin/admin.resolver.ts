import { UseGuards } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards';

import { AdminService } from './admin.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}
}
