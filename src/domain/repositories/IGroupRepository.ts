import { Group } from '../entities/Group';

export interface IGroupRepository {
  create(group: Group): Promise<void>;
  findById(id: string): Promise<Group | null>;
  findByName(name: string): Promise<Group | null>;
  findPublicGroups(): Promise<Group[]>;
  findByCreatorId(creatorId: string): Promise<Group[]>;
  update(group: Group): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Group[]>;
}
