import { Injectable, NotFoundException } from '@nestjs/common';
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

  async paginate(args: FindManyMemberArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
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
