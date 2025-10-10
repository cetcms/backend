import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Target,
  CompanyUser,
  CreateOneCompanyUserArgs,
  FindManyCompanyUserArgs,
  FindUniqueCompanyUserArgs,
  UpdateOneCompanyUserArgs,
} from 'src/generated/graphql';

import { CompanyUserService } from '../services';

const PaginatedCompanyUser = Paginated(CompanyUser);

/**
 * 企业用户管理
 * @group Company
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class CompanyUserResolver {
  constructor(private readonly service: CompanyUserService) {}

  /**
   * 查询单个企业用户关联
   * @param args
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => CompanyUser)
  findOneCompanyUser(@Args() args: FindUniqueCompanyUserArgs): Promise<CompanyUser> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询企业用户关联
   * @param args
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => PaginatedCompanyUser)
  paginateCompanyUsers(@Args() args: FindManyCompanyUserArgs): Promise<IPaginated<CompanyUser>> {
    return this.service.paginate(args);
  }

  /**
   * 新增企业用户关联
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyUser)
  createOneCompanyUser(@Args() args: CreateOneCompanyUserArgs): Promise<CompanyUser> {
    return this.service.createOne(args);
  }

  /**
   * 修改企业用户关联
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyUser)
  updateOneCompanyUser(@Args() args: UpdateOneCompanyUserArgs): Promise<CompanyUser> {
    return this.service.updateOne(args);
  }
}
