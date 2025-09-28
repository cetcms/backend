import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuthCompany, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Company,
  Target,
  CreateOneCompanyArgs,
  FindManyCompanyArgs,
  FindUniqueCompanyArgs,
  UpdateOneCompanyArgs,
  CompanyUpdateInput,
} from 'src/generated/graphql';

import { CompanyService } from '../services';

const PaginatedCompany = Paginated(Company);

/**
 * 企业模块
 * @module Company
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class CompanyResolver {
  constructor(private readonly service: CompanyService) {}

  /**
   * 查询当前企业信息
   * @param company
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => Company)
  findSelfCompany(@CurrentAuthCompany() company: Company): Company {
    return company;
  }

  /**
   * 查询单个企业
   * @param args
   */
  @UsePermission([Target.Admin])
  @Query(() => Company)
  findOneCompany(@Args() args: FindUniqueCompanyArgs): Promise<Company> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询企业
   * @param args
   */
  @UsePermission([Target.Admin])
  @Query(() => PaginatedCompany)
  paginateCompanies(@Args() args: FindManyCompanyArgs): Promise<IPaginated<Company>> {
    return this.service.paginate(args);
  }

  /**
   * 新增企业
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Company)
  createOneCompany(@Args() args: CreateOneCompanyArgs): Promise<Company> {
    return this.service.createOne(args);
  }

  /**
   * 修改当前企业信息
   * @param company
   * @param data
   */
  @UsePermission([Target.Admin, Target.User])
  @Mutation(() => Company)
  updateSelfCompany(@CurrentAuthCompany() company: Company, @Args('data') data: CompanyUpdateInput) {
    return this.service.updateOne({ where: { id: company.id }, data });
  }

  /**
   * 修改企业
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Company)
  updateOneCompany(@Args() args: UpdateOneCompanyArgs): Promise<Company> {
    return this.service.updateOne(args);
  }

  /**
   * 根据ID查询企业
   * @param id
   */
  @UsePermission([Target.Admin])
  @Query(() => Company)
  findCompanyById(@Args('id') id: string): Promise<Company> {
    return this.service.findOneById(id);
  }

  /**
   * 根据名称查询企业
   * @param name
   */
  @UsePermission([Target.Admin])
  @Query(() => Company)
  findCompanyByName(@Args('name') name: string): Promise<Company> {
    return this.service.findOneByName(name);
  }

  /**
   * 根据代码查询企业
   * @param code
   */
  @UsePermission([Target.Admin])
  @Query(() => Company)
  findCompanyByCode(@Args('code') code: string): Promise<Company> {
    return this.service.findOneByCode(code);
  }
}
