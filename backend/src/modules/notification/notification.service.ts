import { randomUUID } from 'node:crypto';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../../database/data-source.js';
import { Notification } from './notification.entity.js';

export class NotificationService {
  private notificationRepo = AppDataSource.getRepository(Notification);

  async listForUser(userId: string) {
    return this.notificationRepo.find({
      where: [{ userId }, { userId: IsNull() }],
      order: { createdAt: 'DESC' },
    });
  }

  async listAll() {
    return this.notificationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: { userId?: string | null; type: string; title: string; message: string }) {
    const notification = this.notificationRepo.create({
      id: randomUUID(),
      userId: data.userId || null,
      type: data.type,
      title: data.title,
      message: data.message,
    });

    return this.notificationRepo.save(notification);
  }

  async markRead(id: string, userId?: string) {
    const notification = await this.notificationRepo.findOneBy({ id });
    if (!notification) {
      return null;
    }
    if (userId && notification.userId !== userId && notification.userId !== null) {
      return null;
    }

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }
}
