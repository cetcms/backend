import { Injectable, NotFoundException } from '@nestjs/common';

import { PaginationResult } from 'src/common/dto';
import {
  CreateOneAdminCompanyArgs,
  FindManyAdminCompanyArgs,
  FindUniqueAdminCompanyArgs,
  UpdateOneAdminCompanyArgs,
} from 'src/generated/graphql';
import { AdminCompanyRepository } from 'src/repositories';

@Injectable()
export class AdminCompanyService {
  constructor(private readonly adminCompany: AdminCompanyRepository) {}

  async findOneByUnique(args: FindUniqueAdminCompanyArgs) {
    const { where } = args;
    const adminCompany = await this.adminCompany.findUnique(where);
    if (adminCompany) {
      return adminCompany;
    }
    throw new NotFoundException('管理员企业关联不存在');
  }

  async paginate(args: FindManyAdminCompanyArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [adminCompanies, totalCount] = await this.adminCompany.findManyAndCount(args);
    return PaginationResult(adminCompanies, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneAdminCompanyArgs) {
    const { data } = args;
    return this.adminCompany.create(data);
  }

  updateOne(args: UpdateOneAdminCompanyArgs) {
    const { where, data } = args;
    return this.adminCompany.update(where, data);
  }

  deleteByUnique(adminId: string, companyId: string) {
    return this.adminCompany.deleteByUnique(adminId, companyId);
  }
}
