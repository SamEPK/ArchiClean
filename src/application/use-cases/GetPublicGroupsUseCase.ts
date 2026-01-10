import { IGroupRepository } from '@domain/repositories/IGroupRepository';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export interface PublicGroupItem {
  id: string;
  name: string;
  description?: string;
  creatorName: string;
  memberCount: number;
  createdAt: Date;
}

export interface GetPublicGroupsResponse {
  groups: PublicGroupItem[];
  totalGroups: number;
}

export class GetPublicGroupsUseCase {
  constructor(
    private readonly groupRepository: IGroupRepository,
    private readonly groupMemberRepository: IGroupMemberRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<GetPublicGroupsResponse> {
    // Get all public groups
    const publicGroups = await this.groupRepository.findPublicGroups();

    const groups: PublicGroupItem[] = [];

    for (const group of publicGroups) {
      // Get creator name
      const creator = await this.userRepository.findById(group.creatorId);
      const creatorName = creator
        ? `${creator.firstName} ${creator.lastName}`
        : 'Unknown';

      // Get member count
      const members = await this.groupMemberRepository.findGroupMembers(group.id);

      groups.push({
        id: group.id,
        name: group.name,
        description: group.description,
        creatorName,
        memberCount: members.length,
        createdAt: group.createdAt,
      });
    }

    // Sort by member count (most popular first), then by creation date (newest first)
    groups.sort((a, b) => {
      if (b.memberCount !== a.memberCount) {
        return b.memberCount - a.memberCount;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return {
      groups,
      totalGroups: groups.length,
    };
  }
}
