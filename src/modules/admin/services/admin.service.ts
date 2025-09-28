import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import { CreateOneAdminArgs, FindManyAdminArgs, FindUniqueAdminArgs, UpdateOneAdminArgs } from 'src/generated/graphql';
import { AdminRepository } from 'src/repositories';

@Injectable()
export class AdminService {
  constructor(private readonly admin: AdminRepository) {}

  async findOneByUnique(args: FindUniqueAdminArgs) {
    const { where } = args;
    const admin = await this.admin.findUnique(where);
    if (admin) {
      return admin;
    }
    throw new NotFoundException('管理员不存在');
  }

  async paginate(args: FindManyAdminArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [admins, totalCount] = await this.admin.findManyAndCount(args);
    return PaginationResult(admins, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneAdminArgs) {
    const { data } = args;
    return this.admin.create(data);
  }

  updateOne(args: UpdateOneAdminArgs) {
    const { where, data } = args;
    return this.admin.update(where, data);
  }

  async findOneById(id: string) {
    const admin = await this.admin.findOneById(id);
    if (admin) {
      return admin;
    }
    throw new NotFoundException('管理员不存在');
  }

  async findOneByEmail(email: string) {
    const admin = await this.admin.findOneByEmail(email);
    if (admin) {
      return admin;
    }
    throw new NotFoundException('管理员不存在');
  }
}
