import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentAuthAdmin, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Admin,
  Client,
  CreateOneAdminArgs,
  FindManyAdminArgs,
  FindUniqueAdminArgs,
  UpdateOneAdminArgs,
  AdminUpdateInput,
} from 'src/generated/graphql';

import { AdminService } from '../services';

const PaginatedAdmin = Paginated(Admin);

/**
 * 管理员管理
 * @group Admin
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class AdminResolver {
  constructor(private readonly service: AdminService) {}

  /**
   * 查询当前管理员信息
   * @param admin
   */
  @UsePermission([Client.Admin])
  @Query(() => Admin)
  findSelfAdmin(@CurrentAuthAdmin() admin: Admin): Admin {
    return admin;
  }

  /**
   * 查询单个管理员
   * @param args
   */
  @UsePermission([Client.Admin])
  @Query(() => Admin)
  findOneAdmin(@Args() args: FindUniqueAdminArgs): Promise<Admin> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询管理员
   * @param args
   */
  @UsePermission([Client.Admin])
  @Query(() => PaginatedAdmin)
  paginateAdmins(@Args() args: FindManyAdminArgs): Promise<IPaginated<Admin>> {
    return this.service.paginate(args);
  }

  /**
   * 新增管理员
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Admin)
  createOneAdmin(@Args() args: CreateOneAdminArgs): Promise<Admin> {
    return this.service.createOne(args);
  }

  /**
   * 修改当前管理员信息
   * @param admin
   * @param data
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Admin)
  updateSelfAdmin(@CurrentAuthAdmin() admin: Admin, @Args('data') data: AdminUpdateInput) {
    return this.service.updateOne({ where: { id: admin.id }, data });
  }

  /**
   * 修改管理员
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Admin)
  updateOneAdmin(@Args() args: UpdateOneAdminArgs): Promise<Admin> {
    return this.service.updateOne(args);
  }

  /**
   * 根据ID查询管理员
   * @param id
   */
  @UsePermission([Client.Admin])
  @Query(() => Admin)
  findAdminById(@Args('id') id: string): Promise<Admin> {
    return this.service.findOneById(id);
  }

  /**
   * 根据邮箱查询管理员
   * @param email
   */
  @UsePermission([Client.Admin])
  @Query(() => Admin)
  findAdminByEmail(@Args('email') email: string): Promise<Admin> {
    return this.service.findOneByEmail(email);
  }
}
