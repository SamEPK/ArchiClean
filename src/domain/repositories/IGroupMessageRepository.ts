import { GroupMessage } from '../entities/GroupMessage';

export interface IGroupMessageRepository {
  create(message: GroupMessage): Promise<void>;
  findById(id: string): Promise<GroupMessage | null>;
  findByGroupId(groupId: string, limit?: number): Promise<GroupMessage[]>;
  findAll(): Promise<GroupMessage[]>;
}
