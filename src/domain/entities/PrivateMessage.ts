export interface PrivateMessageProps {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export class PrivateMessage {
  public readonly id: string;
  public readonly senderId: string;
  public readonly receiverId: string;
  public readonly content: string;
  public isRead: boolean;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  constructor(props: PrivateMessageProps) {
    this.id = props.id;
    this.senderId = props.senderId;
    this.receiverId = props.receiverId;
    this.content = props.content;
    this.isRead = props.isRead;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public markAsRead(): void {
    this.isRead = true;
    this.updatedAt = new Date();
  }

  public getConversationId(): string {
    // Generate a consistent conversation ID regardless of sender/receiver order
    const ids = [this.senderId, this.receiverId].sort();
    return `${ids[0]}_${ids[1]}`;
  }
}
