import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuthUser, RequireCompany, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  User,
  Target,
  CreateOneUserArgs,
  FindManyUserArgs,
  FindUniqueUserArgs,
  UpdateOneUserArgs,
  UserUpdateInput,
} from 'src/generated/graphql';

import { UserService } from './user.service';

const PaginatedUser = Paginated(User);

/**
 * 用户模块
 * @module User
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class UserResolver {
  constructor(private readonly service: UserService) {}

  /**
   * 查询当前用户信息
   * @param user
   */
  @UsePermission([Target.User])
  @Query(() => User)
  findSelfUser(@CurrentAuthUser() user: User): User {
    return user;
  }

  /**
   * 查询单个用户
   * @param args
   */
  @UsePermission()
  @RequireCompany([Target.User])
  @Query(() => User)
  findOneUser(@Args() args: FindUniqueUserArgs): Promise<User> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询用户
   * @param args
   */
  @UsePermission()
  @RequireCompany([Target.User])
  @Query(() => PaginatedUser)
  paginateUsers(@Args() args: FindManyUserArgs): Promise<IPaginated<User>> {
    return this.service.paginate(args);
  }

  /**
   * 新增用户
   * @param args
   */
  @UsePermission()
  @RequireCompany([Target.User])
  @Mutation(() => User)
  createOneUser(@Args() args: CreateOneUserArgs): Promise<User> {
    return this.service.createOne(args);
  }

  /**
   * 修改当前用户信息
   * @param user
   * @param data
   */
  @UsePermission([Target.User])
  @Mutation(() => User)
  updateSelfUser(@CurrentAuthUser() user: User, @Args('data') data: UserUpdateInput) {
    return this.service.updateOne({ where: { id: user.id }, data });
  }

  /**
   * 修改用户
   * @param args
   */
  @UsePermission()
  @RequireCompany([Target.User])
  @Mutation(() => User)
  updateOneUser(@Args() args: UpdateOneUserArgs): Promise<User> {
    return this.service.updateOne(args);
  }
}
