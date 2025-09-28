import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuthAdmin, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  AdminCompany,
  Admin,
  Target,
  CreateOneAdminCompanyArgs,
  FindManyAdminCompanyArgs,
  FindUniqueAdminCompanyArgs,
  UpdateOneAdminCompanyArgs,
} from 'src/generated/graphql';

import { AdminCompanyService } from '../services';

const PaginatedAdminCompany = Paginated(AdminCompany);

/**
 * 管理员企业关联模块
 * @module AdminCompany
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class AdminCompanyResolver {
  constructor(private readonly service: AdminCompanyService) {}

  /**
   * 查询单个管理员企业关联
   * @param args
   */
  @UsePermission([Target.Admin])
  @Query(() => AdminCompany)
  findOneAdminCompany(@Args() args: FindUniqueAdminCompanyArgs): Promise<AdminCompany> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询管理员企业关联
   * @param args
   */
  @UsePermission([Target.Admin])
  @Query(() => PaginatedAdminCompany)
  paginateAdminCompanies(@Args() args: FindManyAdminCompanyArgs): Promise<IPaginated<AdminCompany>> {
    return this.service.paginate(args);
  }

  /**
   * 新增管理员企业关联
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => AdminCompany)
  createOneAdminCompany(@Args() args: CreateOneAdminCompanyArgs): Promise<AdminCompany> {
    return this.service.createOne(args);
  }

  /**
   * 修改管理员企业关联
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => AdminCompany)
  updateOneAdminCompany(@Args() args: UpdateOneAdminCompanyArgs): Promise<AdminCompany> {
    return this.service.updateOne(args);
  }

  /**
   * 根据管理员ID和企业ID查询关联
   * @param adminId
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => AdminCompany)
  findAdminCompanyByAdminAndCompany(
    @Args('adminId') adminId: string,
    @Args('companyId') companyId: string
  ): Promise<AdminCompany> {
    return this.service.findOneByAdminAndCompany(adminId, companyId);
  }

  /**
   * 根据管理员ID查询企业关联列表
   * @param adminId
   */
  @UsePermission([Target.Admin])
  @Query(() => [AdminCompany])
  findAdminCompaniesByAdminId(@Args('adminId') adminId: string): Promise<AdminCompany[]> {
    return this.service.findManyByAdminId(adminId);
  }

  /**
   * 根据当前管理员查询企业关联列表
   * @param admin
   */
  @UsePermission([Target.Admin])
  @Query(() => [AdminCompany])
  findAdminCompaniesByAdmin(@CurrentAuthAdmin() admin: Admin): Promise<AdminCompany[]> {
    return this.service.findManyByAdminId(admin.id);
  }

  /**
   * 根据企业ID查询管理员关联列表
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => [AdminCompany])
  findAdminCompaniesByCompanyId(@Args('companyId') companyId: string): Promise<AdminCompany[]> {
    return this.service.findManyByCompanyId(companyId);
  }

  /**
   * 删除管理员企业关联
   * @param adminId
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Boolean)
  async deleteAdminCompany(@Args('adminId') adminId: string, @Args('companyId') companyId: string): Promise<boolean> {
    await this.service.deleteByUnique(adminId, companyId);
    return true;
  }
}
