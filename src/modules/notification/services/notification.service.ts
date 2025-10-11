import { Injectable } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import { CreateOneNotificationArgs, FindManyNotificationArgs, UpdateOneNotificationArgs } from 'src/generated/graphql';
import { NotificationRepository } from 'src/repositories';

@Injectable()
export class NotificationService {
  constructor(private readonly notification: NotificationRepository) {}

  async paginate(args: FindManyNotificationArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [notifications, totalCount] = await this.notification.findManyAndCount(args);
    return PaginationResult(notifications, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneNotificationArgs) {
    const { data } = args;
    return this.notification.create(data);
  }

  updateOne(args: UpdateOneNotificationArgs) {
    const { where, data } = args;
    return this.notification.update(where, data);
  }
}
