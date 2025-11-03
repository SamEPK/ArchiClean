import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { Group } from '@domain/entities/Group';

export class InMemoryGroupRepository implements IGroupRepository {
  private groups: Map<string, Group> = new Map();

  async create(group: Group): Promise<void> {
    this.groups.set(group.id, group);
  }

  async findById(id: string): Promise<Group | null> {
    return this.groups.get(id) || null;
  }

  async findByName(name: string): Promise<Group | null> {
    for (const group of this.groups.values()) {
      if (group.name.toLowerCase() === name.toLowerCase()) {
        return group;
      }
    }
    return null;
  }

  async findPublicGroups(): Promise<Group[]> {
    return Array.from(this.groups.values()).filter(g => g.visibility === 'public');
  }

  async findByCreatorId(creatorId: string): Promise<Group[]> {
    return Array.from(this.groups.values()).filter(g => g.creatorId === creatorId);
  }

  async update(group: Group): Promise<void> {
    if (!this.groups.has(group.id)) {
      throw new Error('Group not found');
    }
    this.groups.set(group.id, group);
  }

  async delete(id: string): Promise<void> {
    this.groups.delete(id);
  }

  async findAll(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  clear(): void {
    this.groups.clear();
  }
}
