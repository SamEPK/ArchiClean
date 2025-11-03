export interface GroupMessageProps {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class GroupMessage {
  public readonly id: string;
  public readonly groupId: string;
  public readonly senderId: string;
  public readonly content: string;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  constructor(props: GroupMessageProps) {
    this.id = props.id;
    this.groupId = props.groupId;
    this.senderId = props.senderId;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
