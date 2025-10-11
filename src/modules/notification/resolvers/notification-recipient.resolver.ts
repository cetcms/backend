import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import { Target, NotificationRecipient, FindManyNotificationRecipientArgs } from 'src/generated/graphql';

import { NotificationRecipientService } from '../services';

const PaginatedNotificationRecipient = Paginated(NotificationRecipient);

/**
 * 消息通知接收
 * @group Notification
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class NotificationRecipientResolver {
  constructor(private readonly service: NotificationRecipientService) {}

  /**
   * 分页查询消息接收信息
   * @param args
   */
  @UsePermission()
  @Query(() => PaginatedNotificationRecipient)
  paginateNotificationRecipes(
    @Args() args: FindManyNotificationRecipientArgs
  ): Promise<IPaginated<NotificationRecipient>> {
    return this.service.paginate(args);
  }
}
