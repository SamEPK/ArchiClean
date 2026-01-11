export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'message' | 'promotion';

export class Notification {
  constructor(
    public readonly id: string,
    public readonly recipientId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly type: NotificationType = 'info',
    public readonly senderId?: string,
    public readonly senderName?: string,
    public readonly createdAt: Date = new Date(),
    public isRead: boolean = false,
    public readonly data?: Record<string, any>,
  ) {
    this.validateMessage();
  }

  private validateMessage(): void {
    if (!this.message || this.message.trim().length === 0) {
      throw new Error('Notification message cannot be empty');
    }
  }

  public markAsRead(): void {
    this.isRead = true;
  }

  public toJSON() {
    return {
      id: this.id,
      recipientId: this.recipientId,
      title: this.title,
      message: this.message,
      type: this.type,
      senderId: this.senderId,
      senderName: this.senderName,
      createdAt: this.createdAt.toISOString(),
      isRead: this.isRead,
      data: this.data,
    };
  }
}
