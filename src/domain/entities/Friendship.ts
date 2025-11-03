export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface FriendshipProps {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export class Friendship {
  public readonly id: string;
  public readonly requesterId: string;
  public readonly addresseeId: string;
  public status: FriendshipStatus;
  public readonly createdAt: Date;
  public updatedAt?: Date;

  constructor(props: FriendshipProps) {
    this.id = props.id;
    this.requesterId = props.requesterId;
    this.addresseeId = props.addresseeId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public accept(): void {
    if (this.status !== 'pending') {
      throw new Error('Can only accept pending friend requests');
    }
    this.status = 'accepted';
    this.updatedAt = new Date();
  }

  public reject(): void {
    if (this.status !== 'pending') {
      throw new Error('Can only reject pending friend requests');
    }
    this.status = 'rejected';
    this.updatedAt = new Date();
  }

  public block(): void {
    this.status = 'blocked';
    this.updatedAt = new Date();
  }

  public isPending(): boolean {
    return this.status === 'pending';
  }

  public isAccepted(): boolean {
    return this.status === 'accepted';
  }

  public areFriends(userId1: string, userId2: string): boolean {
    return (
      this.status === 'accepted' &&
      ((this.requesterId === userId1 && this.addresseeId === userId2) ||
        (this.requesterId === userId2 && this.addresseeId === userId1))
    );
  }
}
