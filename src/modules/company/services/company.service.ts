import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneCompanyArgs,
  FindManyCompanyArgs,
  FindUniqueCompanyArgs,
  UpdateOneCompanyArgs,
} from 'src/generated/graphql';
import { CompanyRepository } from 'src/repositories';

@Injectable()
export class CompanyService {
  constructor(private readonly company: CompanyRepository) {}

  async findOneByUnique(args: FindUniqueCompanyArgs) {
    const { where } = args;
    const company = await this.company.findUnique(where);
    if (company) {
      return company;
    }
    throw new NotFoundException('企业不存在');
  }

  async paginate(args: FindManyCompanyArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [companies, totalCount] = await this.company.findManyAndCount(args);
    return PaginationResult(companies, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneCompanyArgs) {
    const { data } = args;
    return this.company.create(data);
  }

  updateOne(args: UpdateOneCompanyArgs) {
    const { where, data } = args;
    return this.company.update(where, data);
  }

  async findOneById(id: string) {
    const company = await this.company.findOneById(id);
    if (company) {
      return company;
    }
    throw new NotFoundException('企业不存在');
  }

  async findOneByName(name: string) {
    const company = await this.company.findOneByName(name);
    if (company) {
      return company;
    }
    throw new NotFoundException('企业不存在');
  }

  async findOneByCode(code: string) {
    const company = await this.company.findOneByCode(code);
    if (company) {
      return company;
    }
    throw new NotFoundException('企业不存在');
  }
}
