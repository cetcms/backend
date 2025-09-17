import { Resolver } from '@nestjs/graphql';
import { Admin } from 'src/generated/graphql';
import { AdminRepository } from 'src/repositories';

@Resolver(Admin)
export class AdminExtend {
  constructor(private readonly admin: AdminRepository) {}
}
