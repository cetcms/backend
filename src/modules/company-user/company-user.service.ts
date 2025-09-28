import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneCompanyUserArgs,
  FindManyCompanyUserArgs,
  FindUniqueCompanyUserArgs,
  UpdateOneCompanyUserArgs,
} from 'src/generated/graphql';
import { CompanyUserRepository } from 'src/repositories';

@Injectable()
export class CompanyUserService {
  constructor(private readonly companyUser: CompanyUserRepository) {}

  async findOneByUnique(args: FindUniqueCompanyUserArgs) {
    const { where } = args;
    const companyUser = await this.companyUser.findUnique(where);
    if (companyUser) {
      return companyUser;
    }
    throw new NotFoundException('企业用户关联不存在');
  }

  async paginate(args: FindManyCompanyUserArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [companyUsers, totalCount] = await this.companyUser.findManyAndCount(args);
    return PaginationResult(companyUsers, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneCompanyUserArgs) {
    const { data } = args;
    return this.companyUser.create(data);
  }

  updateOne(args: UpdateOneCompanyUserArgs) {
    const { where, data } = args;
    return this.companyUser.update(where, data);
  }

  async findOneByUserAndCompany(userId: string, companyId: string) {
    const companyUser = await this.companyUser.findOneByUnique(userId, companyId);
    if (companyUser) {
      return companyUser;
    }
    throw new NotFoundException('企业用户关联不存在');
  }

  async findManyByUserId(userId: string) {
    return this.companyUser.findManyByUserId(userId);
  }

  async findManyByCompanyId(companyId: string) {
    return this.companyUser.findManyByCompanyId(companyId);
  }
}
