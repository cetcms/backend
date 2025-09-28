import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import { CreateOneUserArgs, FindManyUserArgs, FindUniqueUserArgs, UpdateOneUserArgs } from 'src/generated/graphql';
import { UserRepository } from 'src/repositories';

@Injectable()
export class UserService {
  constructor(private readonly user: UserRepository) {}

  async findOneByUnique(args: FindUniqueUserArgs) {
    const { where } = args;
    const user = await this.user.findUnique(where);
    if (user) {
      return user;
    }
    throw new NotFoundException('用户不存在');
  }

  async paginate(args: FindManyUserArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [users, totalCount] = await this.user.findManyAndCount(args);
    return PaginationResult(users, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneUserArgs) {
    const { data } = args;
    return this.user.create(data);
  }

  updateOne(args: UpdateOneUserArgs) {
    const { where, data } = args;
    return this.user.update(where, data);
  }

  async findOneById(id: string) {
    const user = await this.user.findOneById(id);
    if (user) {
      return user;
    }
    throw new NotFoundException('用户不存在');
  }

  async findOneByEmail(email: string) {
    const user = await this.user.findOneByEmail(email);
    if (user) {
      return user;
    }
    throw new NotFoundException('用户不存在');
  }

  async findByEmailAndCheckPassword(email: string, password: string) {
    const user = await this.user.findByEmailAndCheckPassword(email, password);
    if (user) {
      return user;
    }
    throw new NotFoundException('用户不存在或密码错误');
  }

  async findByIdAndCheckPassword(id: string, password: string) {
    const user = await this.user.findByIdAndCheckPassword(id, password);
    if (user) {
      return user;
    }
    throw new NotFoundException('用户不存在或密码错误');
  }
}
