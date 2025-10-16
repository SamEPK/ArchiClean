export interface MessageProps {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp?: Date;
  isRead?: boolean;
}

export class Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;

  constructor(props: MessageProps) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.content = props.content;
    this.timestamp = props.timestamp ?? new Date();
    this.isRead = props.isRead ?? false;
  }
}
