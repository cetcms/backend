import { Injectable } from '@nestjs/common';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneNotificationRecipientArgs,
  FindManyNotificationRecipientArgs,
  UpdateOneNotificationRecipientArgs,
} from 'src/generated/graphql';
import { NotificationRecipientRepository } from 'src/repositories';

@Injectable()
export class NotificationRecipientService {
  constructor(private readonly notification: NotificationRecipientRepository) {}

  async paginate(args: FindManyNotificationRecipientArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [notifications, totalCount] = await this.notification.findManyAndCount(args);
    return PaginationResult(notifications, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneNotificationRecipientArgs) {
    const { data } = args;
    return this.notification.create(data);
  }

  updateOne(args: UpdateOneNotificationRecipientArgs) {
    const { where, data } = args;
    return this.notification.update(where, data);
  }
}
