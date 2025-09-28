import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuthCompany, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  CompanyRole,
  Company,
  Target,
  CreateOneCompanyRoleArgs,
  FindManyCompanyRoleArgs,
  FindUniqueCompanyRoleArgs,
  UpdateOneCompanyRoleArgs,
} from 'src/generated/graphql';

import { CompanyRoleService } from '../services';

const PaginatedCompanyRole = Paginated(CompanyRole);

/**
 * 企业角色模块
 * @module CompanyRole
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class CompanyRoleResolver {
  constructor(private readonly service: CompanyRoleService) {}

  /**
   * 查询单个企业角色
   * @param args
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => CompanyRole)
  findOneCompanyRole(@Args() args: FindUniqueCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询企业角色
   * @param args
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => PaginatedCompanyRole)
  paginateCompanyRoles(@Args() args: FindManyCompanyRoleArgs): Promise<IPaginated<CompanyRole>> {
    return this.service.paginate(args);
  }

  /**
   * 新增企业角色
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyRole)
  createOneCompanyRole(@Args() args: CreateOneCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.createOne(args);
  }

  /**
   * 修改企业角色
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyRole)
  updateOneCompanyRole(@Args() args: UpdateOneCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.updateOne(args);
  }

  /**
   * 根据ID查询企业角色
   * @param id
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => CompanyRole)
  findCompanyRoleById(@Args('id') id: string): Promise<CompanyRole> {
    return this.service.findOneById(id);
  }

  /**
   * 根据企业ID查询角色列表
   * @param company
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => [CompanyRole])
  findCompanyRolesByCompany(@CurrentAuthCompany() company: Company): Promise<CompanyRole[]> {
    return this.service.findByCompanyId(company.id);
  }

  /**
   * 根据企业ID查询角色列表
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => [CompanyRole])
  findCompanyRolesByCompanyId(@Args('companyId') companyId: string): Promise<CompanyRole[]> {
    return this.service.findByCompanyId(companyId);
  }

  /**
   * 根据名称查询企业角色
   * @param name
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => CompanyRole)
  findCompanyRoleByName(@Args('name') name: string): Promise<CompanyRole> {
    return this.service.findOneByName(name);
  }

  /**
   * 查询通用角色
   * @param code
   */
  @UsePermission([Target.Admin])
  @Query(() => CompanyRole, { nullable: true })
  findCommonCompanyRole(@Args('code') code: string): Promise<CompanyRole | null> {
    return this.service.findCommonRole(code);
  }
}
