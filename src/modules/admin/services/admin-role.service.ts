import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneAdminRoleArgs,
  FindManyAdminRoleArgs,
  FindUniqueAdminRoleArgs,
  UpdateOneAdminRoleArgs,
} from 'src/generated/graphql';
import { AdminRoleRepository } from 'src/repositories';

@Injectable()
export class AdminRoleService {
  constructor(private readonly adminRole: AdminRoleRepository) {}

  async findOneByUnique(args: FindUniqueAdminRoleArgs) {
    const { where } = args;
    const adminRole = await this.adminRole.findUnique(where);
    if (adminRole) {
      return adminRole;
    }
    throw new NotFoundException('管理员角色不存在');
  }

  async paginate(args: FindManyAdminRoleArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [adminRoles, totalCount] = await this.adminRole.findManyAndCount(args);
    return PaginationResult(adminRoles, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneAdminRoleArgs) {
    const { data } = args;
    return this.adminRole.create(data);
  }

  updateOne(args: UpdateOneAdminRoleArgs) {
    const { where, data } = args;
    return this.adminRole.update(where, data);
  }
}
