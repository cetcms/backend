import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuthCompany, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  CompanyUser,
  Company,
  Target,
  CreateOneCompanyUserArgs,
  FindManyCompanyUserArgs,
  FindUniqueCompanyUserArgs,
  UpdateOneCompanyUserArgs,
} from 'src/generated/graphql';

import { CompanyUserService } from '../services';

const PaginatedCompanyUser = Paginated(CompanyUser);

/**
 * 企业用户关联模块
 * @module CompanyUser
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

  /**
   * 根据用户ID和企业ID查询关联
   * @param userId
   * @param companyId
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => CompanyUser)
  findCompanyUserByUserAndCompany(
    @Args('userId') userId: string,
    @Args('companyId') companyId: string
  ): Promise<CompanyUser> {
    return this.service.findOneByUserAndCompany(userId, companyId);
  }

  /**
   * 根据用户ID查询企业关联列表
   * @param userId
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => [CompanyUser])
  findCompanyUsersByUserId(@Args('userId') userId: string): Promise<CompanyUser[]> {
    return this.service.findManyByUserId(userId);
  }

  /**
   * 根据当前企业查询用户关联列表
   * @param company
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => [CompanyUser])
  findCompanyUsersByCompany(@CurrentAuthCompany() company: Company): Promise<CompanyUser[]> {
    return this.service.findManyByCompanyId(company.id);
  }

  /**
   * 根据企业ID查询用户关联列表
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => [CompanyUser])
  findCompanyUsersByCompanyId(@Args('companyId') companyId: string): Promise<CompanyUser[]> {
    return this.service.findManyByCompanyId(companyId);
  }
}
