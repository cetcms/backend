import { Injectable, NotFoundException } from '@nestjs/common';
import { isEmail } from 'class-validator';

import { CurrentAuth } from 'src/auth/decorators';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneMemberArgs,
  FindManyMemberArgs,
  FindUniqueMemberArgs,
  UpdateOneMemberArgs,
} from 'src/generated/graphql';
import { MemberRepository } from 'src/repositories';

@Injectable()
export class MemberService {
  constructor(private readonly member: MemberRepository) {}

  async findOneByUnique(args: FindUniqueMemberArgs) {
    const { where } = args;
    const member = await this.member.findUnique(where);
    if (member) {
      return member;
    }
    throw new NotFoundException('成员不存在');
  }

  async searchOnCompany(keyword?: string, companyId?: string | null) {
    const args: FindManyMemberArgs = {};
    args.take = 10;
    args.skip = 0;
    // 对企业可查询的范围做限制
    if (!keyword || keyword.length < 2 || !companyId) {
      return PaginationResult([], args.take, args.skip, 0);
    }
    if (isEmail(keyword)) {
      args.where = {
        OR: [{ email: { equals: keyword } }, { name: { contains: keyword } }],
      };
    } else {
      args.where = { name: { contains: keyword } };
    }
    const [members, totalCount] = await this.member
      .setInclude({
        companies: {
          where: { companyId: { equals: companyId } },
        },
      })
      .findManyAndCount(args);
    return PaginationResult(members, args.take, args.skip, totalCount);
  }

  async paginate(args: FindManyMemberArgs, auth?: CurrentAuth) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    // 对企业可查询的范围做限制
    if (auth && auth.companyId) {
      args.where = {
        ...args.where,
        companies: {
          some: { companyId: { equals: auth.companyId }, invitePassed: { equals: true } },
        },
      };
    }
    const [members, totalCount] = await this.member.findManyAndCount(args);
    return PaginationResult(members, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneMemberArgs) {
    const { data } = args;
    return this.member.create(data);
  }

  updateOne(args: UpdateOneMemberArgs) {
    const { where, data } = args;
    return this.member.update(where, data);
  }
}
