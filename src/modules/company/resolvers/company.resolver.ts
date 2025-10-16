import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, CurrentAuthCompany, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Client,
  Company,
  CreateOneCompanyArgs,
  FindManyCompanyArgs,
  FindUniqueCompanyArgs,
  UpdateOneCompanyArgs,
  CompanyUpdateInput,
} from 'src/generated/graphql';

import { CompanyService } from '../services';

const PaginatedCompany = Paginated(Company);

/**
 * 企业管理
 * @group Company
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class CompanyResolver {
  constructor(private readonly service: CompanyService) {}

  /**
   * 查询当前企业信息
   * @param company
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => Company)
  findSelfCompany(@CurrentAuthCompany() company: Company): Company {
    return company;
  }

  /**
   * 查询单个企业
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => Company)
  findOneCompany(@Args() args: FindUniqueCompanyArgs): Promise<Company> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询企业
   * @param auth
   * @param args
   */
  @UsePermission()
  @Query(() => PaginatedCompany)
  paginateCompanies(@CurrentAuth() auth: CurrentAuth, @Args() args: FindManyCompanyArgs): Promise<IPaginated<Company>> {
    return this.service.paginate(auth, args);
  }

  /**
   * 新增企业
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Company)
  createOneCompany(@Args() args: CreateOneCompanyArgs): Promise<Company> {
    return this.service.createOne(args);
  }

  /**
   * 修改当前企业信息
   * @param company
   * @param data
   */
  @UsePermission([Client.Company])
  @Mutation(() => Company)
  updateSelfCompany(@CurrentAuthCompany() company: Company, @Args('data') data: CompanyUpdateInput) {
    return this.service.updateOne({ where: { id: company.id }, data });
  }

  /**
   * 修改企业
   * @param auth
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Mutation(() => Company)
  updateOneCompany(@CurrentAuth() auth: CurrentAuth, @Args() args: UpdateOneCompanyArgs): Promise<Company> {
    return this.service.updateOne(args, auth);
  }
}
