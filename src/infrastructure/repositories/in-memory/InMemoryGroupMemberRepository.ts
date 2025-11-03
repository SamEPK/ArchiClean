import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';
import { GroupMember } from '@domain/entities/GroupMember';

export class InMemoryGroupMemberRepository implements IGroupMemberRepository {
  private members: Map<string, GroupMember> = new Map();

  async create(member: GroupMember): Promise<void> {
    this.members.set(member.id, member);
  }

  async findById(id: string): Promise<GroupMember | null> {
    return this.members.get(id) || null;
  }

  async findByGroupAndUser(groupId: string, userId: string): Promise<GroupMember | null> {
    for (const member of this.members.values()) {
      if (member.groupId === groupId && member.userId === userId) {
        return member;
      }
    }
    return null;
  }

  async findGroupMembers(groupId: string): Promise<GroupMember[]> {
    return Array.from(this.members.values()).filter(m => m.groupId === groupId);
  }

  async findUserGroups(userId: string): Promise<GroupMember[]> {
    return Array.from(this.members.values()).filter(m => m.userId === userId);
  }

  async update(member: GroupMember): Promise<void> {
    if (!this.members.has(member.id)) {
      throw new Error('Member not found');
    }
    this.members.set(member.id, member);
  }

  async delete(id: string): Promise<void> {
    this.members.delete(id);
  }

  async findAll(): Promise<GroupMember[]> {
    return Array.from(this.members.values());
  }

  clear(): void {
    this.members.clear();
  }
}
