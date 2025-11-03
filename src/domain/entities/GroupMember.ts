export type GroupMemberRole = 'owner' | 'admin' | 'member';
export type GroupMemberStatus = 'active' | 'invited' | 'banned';

export interface GroupMemberProps {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joinedAt: Date;
  updatedAt?: Date;
}

export class GroupMember {
  public readonly id: string;
  public readonly groupId: string;
  public readonly userId: string;
  public role: GroupMemberRole;
  public status: GroupMemberStatus;
  public readonly joinedAt: Date;
  public updatedAt?: Date;

  constructor(props: GroupMemberProps) {
    this.id = props.id;
    this.groupId = props.groupId;
    this.userId = props.userId;
    this.role = props.role;
    this.status = props.status;
    this.joinedAt = props.joinedAt;
    this.updatedAt = props.updatedAt;
  }

  public promoteToAdmin(): void {
    if (this.role === 'owner') {
      throw new Error('Owner cannot be promoted');
    }
    this.role = 'admin';
    this.updatedAt = new Date();
  }

  public demoteToMember(): void {
    if (this.role === 'owner') {
      throw new Error('Owner cannot be demoted');
    }
    this.role = 'member';
    this.updatedAt = new Date();
  }

  public acceptInvitation(): void {
    if (this.status !== 'invited') {
      throw new Error('Can only accept invitations with invited status');
    }
    this.status = 'active';
    this.updatedAt = new Date();
  }

  public ban(): void {
    if (this.role === 'owner') {
      throw new Error('Cannot ban the owner');
    }
    this.status = 'banned';
    this.updatedAt = new Date();
  }

  public unban(): void {
    if (this.status !== 'banned') {
      throw new Error('Can only unban banned members');
    }
    this.status = 'active';
    this.updatedAt = new Date();
  }

  public isOwner(): boolean {
    return this.role === 'owner';
  }

  public isAdmin(): boolean {
    return this.role === 'admin' || this.role === 'owner';
  }

  public isActive(): boolean {
    return this.status === 'active';
  }

  public isInvited(): boolean {
    return this.status === 'invited';
  }

  public isBanned(): boolean {
    return this.status === 'banned';
  }
}
