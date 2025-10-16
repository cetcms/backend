import { Injectable, NotFoundException } from '@nestjs/common';
import { CurrentAuth } from 'src/auth/decorators';
import { PaginationResult } from 'src/common/dto';
import { SystemContract } from 'src/contracts';
import {
  CreateOneCompanyArgs,
  FindManyCompanyArgs,
  FindUniqueCompanyArgs,
  UpdateOneCompanyArgs,
} from 'src/generated/graphql';
import { CompanyRepository } from 'src/repositories';

@Injectable()
export class CompanyService {
  constructor(private readonly company: CompanyRepository) {}

  async findOneByUnique(args: FindUniqueCompanyArgs) {
    const { where } = args;
    const company = await this.company.findUnique(where);
    if (company) {
      return company;
    }
    throw new NotFoundException('企业不存在');
  }

  async paginate(auth: CurrentAuth, args: FindManyCompanyArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const { adminRole } = auth;
    // 成员查询范围
    if (auth.memberId) {
      args.where = {
        ...args.where,
        members: {
          some: { memberId: { equals: auth.memberId } },
        },
      };
    }
    // 管理员查询范围
    if (auth.adminId && adminRole?.code !== SystemContract.RootAdminRole) {
      args.where = {
        ...args.where,
        admins: {
          some: { adminId: { equals: auth.adminId } },
        },
      };
    }

    const [companies, totalCount] = await this.company.findManyAndCount(args);
    return PaginationResult(companies, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneCompanyArgs) {
    const { data } = args;
    return this.company.create(data);
  }

  updateOne(args: UpdateOneCompanyArgs) {
    const { where, data } = args;
    return this.company.update(where, data);
  }

  async findOneById(id: string) {
    const company = await this.company.findOneById(id);
    if (company) {
      return company;
    }
    throw new NotFoundException('企业不存在');
  }
}
