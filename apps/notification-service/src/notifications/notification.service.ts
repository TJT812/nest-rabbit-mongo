import { Injectable } from '@nestjs/common';
import { UserPayload } from '../common/interfaces';

@Injectable()
export class NotificationService {
  onUserCreated(data: UserPayload): void {
    console.log(`Hello, ${data.name}, notification was sent to ${data.email}`);
  }

  onUserDeleted(data: UserPayload): void {
    console.log(`Cheers, ${data.name}, notification was sent to ${data.email}`);
  }
}
