import { Controller, Get } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { userEventTypes } from './common/enums';
import { UserPayload } from './common/interfaces';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationServiceService: NotificationServiceService) {}

  @MessagePattern({cmd: userEventTypes.USER_CREATED})
  onUserCreated(@Payload() data: UserPayload, @Ctx() context: RmqContext) {
    this.notificationServiceService.onUserCreated(data);
    this.ack(context);
  } 

  @MessagePattern({cmd: userEventTypes.USER_DELETED})
  onUserDeleted(@Payload() data: UserPayload, @Ctx() context: RmqContext) {
    this.notificationServiceService.onUserDeleted(data);
    this.ack(context);
  } 

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
