import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { CurrentAuth } from 'src/auth/decorators';
import { PaginationResult } from 'src/common/dto';
import { DatabaseService } from 'src/database';
import {
  CreateOneCompanyMemberArgs,
  FindManyCompanyMemberArgs,
  FindUniqueCompanyMemberArgs,
  NotificationPrivacy,
  NotificationTarget,
  UpdateOneCompanyMemberArgs,
} from 'src/generated/graphql';
import { I18nEnum } from 'src/i18n';
import { CompanyMemberRepository, CompanyRoleRepository, NotificationRepository } from 'src/repositories';

@Injectable()
export class CompanyMemberService {
  private readonly logger = new Logger(CompanyMemberService.name);
  constructor(
    private readonly companyMember: CompanyMemberRepository,
    private readonly notification: NotificationRepository,
    private readonly companyRole: CompanyRoleRepository,
    private readonly db: DatabaseService
  ) {}

  async findOneByUnique(args: FindUniqueCompanyMemberArgs) {
    const { where } = args;
    const companyMember = await this.companyMember.findUnique(where);
    if (companyMember) {
      return companyMember;
    }
    throw new NotFoundException('企业成员关联不存在');
  }

  async paginate(args: FindManyCompanyMemberArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [companyMembers, totalCount] = await this.companyMember.findManyAndCount(args);
    return PaginationResult(companyMembers, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneCompanyMemberArgs) {
    const { data } = args;
    return this.companyMember.create(data);
  }

  updateOne(args: UpdateOneCompanyMemberArgs) {
    const { where, data } = args;
    return this.companyMember.update(where, data);
  }

  async inviteMemberToCompany(auth: CurrentAuth, memberId: string, roleId: string) {
    const { companyId } = auth;
    if (!companyId) {
      throw new BadRequestException('Company id is required');
    }

    const member = await this.companyMember.findUnique({
      companyMemberIdx: {
        companyId,
        memberId,
      },
    });
    if (member) {
      throw new BadRequestException('Member already exists');
    }

    const role = await this.companyRole.findOneById(roleId);
    if (role?.companyId !== companyId) {
      throw new BadRequestException('Role does not belong to company');
    }
    try {
      const [_, notification] = await this.db.$transaction([
        this.companyMember.create({
          member: { connect: { id: memberId } },
          company: { connect: { id: companyId } },
          role: { connect: { id: roleId } },
        }),
        this.notification.create({
          sender: NotificationTarget.Company,
          senderId: companyId,
          company: {
            connect: { id: companyId },
          },
          receivers: [NotificationTarget.Member],
          privacy: NotificationPrivacy.Private,
          content: {
            [I18nEnum.En]: 'Invite you to join the company',
            [I18nEnum.Zh]: '邀请您加入企业',
            [I18nEnum.ZhHant]: '邀請您加入企業',
            [I18nEnum.Ja]: '企業への参加を招待します',
            [I18nEnum.Ko]: '기업에 합류하도록 초대합니다',
          },
          recipients: {
            create: [
              {
                receiver: NotificationTarget.Member,
                receiverId: memberId,
                member: { connect: { id: memberId } },
              },
            ],
          },
        }),
      ]);
      return notification;
    } catch (e) {
      this.logger.error(e);
      throw new BadRequestException('Invite member to company failed');
    }
  }
}
