import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneCompanyMemberArgs,
  FindManyCompanyMemberArgs,
  FindUniqueCompanyMemberArgs,
  UpdateOneCompanyMemberArgs,
} from 'src/generated/graphql';
import { CompanyMemberRepository } from 'src/repositories';

@Injectable()
export class CompanyMemberService {
  constructor(private readonly companyMember: CompanyMemberRepository) {}

  async findOneByUnique(args: FindUniqueCompanyMemberArgs) {
    const { where } = args;
    const companyMember = await this.companyMember.findUnique(where);
    if (companyMember) {
      return companyMember;
    }
    throw new NotFoundException('企业成员关联不存在');
  }

  async paginate(args: FindManyCompanyMemberArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [companyMembers, totalCount] = await this.companyMember.findManyAndCount(args);
    return PaginationResult(companyMembers, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneCompanyMemberArgs) {
    const { data } = args;
    return this.companyMember.create(data);
  }

  updateOne(args: UpdateOneCompanyMemberArgs) {
    const { where, data } = args;
    return this.companyMember.update(where, data);
  }
}
