import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneCompanyRoleArgs,
  FindManyCompanyRoleArgs,
  FindUniqueCompanyRoleArgs,
  UpdateOneCompanyRoleArgs,
} from 'src/generated/graphql';
import { CompanyRoleRepository } from 'src/repositories';

@Injectable()
export class CompanyRoleService {
  constructor(private readonly companyRole: CompanyRoleRepository) {}

  async findOneByUnique(args: FindUniqueCompanyRoleArgs) {
    const { where } = args;
    const companyRole = await this.companyRole.findUnique(where);
    if (companyRole) {
      return companyRole;
    }
    throw new NotFoundException('企业角色不存在');
  }

  async paginate(args: FindManyCompanyRoleArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [companyRoles, totalCount] = await this.companyRole.findManyAndCount(args);
    return PaginationResult(companyRoles, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneCompanyRoleArgs) {
    const { data } = args;
    return this.companyRole.create(data);
  }

  updateOne(args: UpdateOneCompanyRoleArgs) {
    const { where, data } = args;
    return this.companyRole.update(where, data);
  }
}
