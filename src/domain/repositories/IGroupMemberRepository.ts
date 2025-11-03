import { GroupMember } from '../entities/GroupMember';

export interface IGroupMemberRepository {
  create(member: GroupMember): Promise<void>;
  findById(id: string): Promise<GroupMember | null>;
  findByGroupAndUser(groupId: string, userId: string): Promise<GroupMember | null>;
  findGroupMembers(groupId: string): Promise<GroupMember[]>;
  findUserGroups(userId: string): Promise<GroupMember[]>;
  update(member: GroupMember): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<GroupMember[]>;
}
