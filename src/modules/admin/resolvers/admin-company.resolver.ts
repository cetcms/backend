import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Client,
  AdminCompany,
  CreateOneAdminCompanyArgs,
  FindManyAdminCompanyArgs,
  FindUniqueAdminCompanyArgs,
  UpdateOneAdminCompanyArgs,
} from 'src/generated/graphql';

import { AdminCompanyService } from '../services';

const PaginatedAdminCompany = Paginated(AdminCompany);

/**
 * 管理员企业管理
 * @group Admin
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class AdminCompanyResolver {
  constructor(private readonly service: AdminCompanyService) {}

  /**
   * 查询单个管理员企业关联
   * @param args
   */
  @UsePermission([Client.Admin])
  @Query(() => AdminCompany)
  findOneAdminCompany(@Args() args: FindUniqueAdminCompanyArgs): Promise<AdminCompany> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询管理员企业关联
   * @param args
   */
  @UsePermission([Client.Admin])
  @Query(() => PaginatedAdminCompany)
  paginateAdminCompanies(@Args() args: FindManyAdminCompanyArgs): Promise<IPaginated<AdminCompany>> {
    return this.service.paginate(args);
  }

  /**
   * 新增管理员企业关联
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => AdminCompany)
  createOneAdminCompany(@Args() args: CreateOneAdminCompanyArgs): Promise<AdminCompany> {
    return this.service.createOne(args);
  }

  /**
   * 修改管理员企业关联
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => AdminCompany)
  updateOneAdminCompany(@Args() args: UpdateOneAdminCompanyArgs): Promise<AdminCompany> {
    return this.service.updateOne(args);
  }

  /**
   * 删除管理员企业关联
   * @param adminId
   * @param companyId
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Boolean)
  async deleteAdminCompany(@Args('adminId') adminId: string, @Args('companyId') companyId: string): Promise<boolean> {
    await this.service.deleteByUnique(adminId, companyId);
    return true;
  }
}
