import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuthMember, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Client,
  CreateOneMemberArgs,
  FindManyMemberArgs,
  FindUniqueMemberArgs,
  Member,
  MemberUpdateInput,
  UpdateOneMemberArgs,
} from 'src/generated/graphql';

import { MemberService } from './member.service';

const PaginatedMember = Paginated(Member);

/**
 * 成员管理
 * @group Member
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class MemberResolver {
  constructor(private readonly service: MemberService) {}

  /**
   * 查询当前成员信息
   * @param member
   */
  @UsePermission([Client.Member])
  @Query(() => Member)
  findSelfMember(@CurrentAuthMember() member: Member): Member {
    return member;
  }

  /**
   * 查询单个成员
   * @param args
   */
  @UsePermission()
  @Query(() => Member)
  findOneMember(@Args() args: FindUniqueMemberArgs): Promise<Member> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询成员
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => PaginatedMember)
  paginateMembers(@Args() args: FindManyMemberArgs): Promise<IPaginated<Member>> {
    return this.service.paginate(args);
  }

  /**
   * 新增成员
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Member)
  createOneMember(@Args() args: CreateOneMemberArgs): Promise<Member> {
    return this.service.createOne(args);
  }

  /**
   * 修改当前成员信息
   * @param member
   * @param data
   */
  @UsePermission([Client.Member])
  @Mutation(() => Member)
  updateSelfMember(@CurrentAuthMember() member: Member, @Args('data') data: MemberUpdateInput) {
    return this.service.updateOne({ where: { id: member.id }, data });
  }

  /**
   * 修改成员
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Member)
  updateOneMember(@Args() args: UpdateOneMemberArgs): Promise<Member> {
    return this.service.updateOne(args);
  }
}
