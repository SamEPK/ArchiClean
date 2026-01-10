import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';

export interface GetMyGroupsRequest {
  userId: string;
}

export interface MyGroupItem {
  id: string;
  name: string;
  description?: string;
  visibility: string;
  creatorId: string;
  isCreator: boolean;
  isAdmin: boolean;
  joinedAt: Date;
  memberCount?: number;
}

export interface GetMyGroupsResponse {
  userId: string;
  groups: MyGroupItem[];
  totalGroups: number;
  adminGroups: number;
}

export class GetMyGroupsUseCase {
  constructor(
    private readonly groupMemberRepository: IGroupMemberRepository,
    private readonly groupRepository: IGroupRepository,
  ) {}

  async execute(request: GetMyGroupsRequest): Promise<GetMyGroupsResponse> {
    // Get all group memberships for this user
    const memberships = await this.groupMemberRepository.findUserGroups(request.userId);

    const groups: MyGroupItem[] = [];
    let adminCount = 0;

    for (const membership of memberships) {
      const group = await this.groupRepository.findById(membership.groupId);

      if (group) {
        const isCreator = group.creatorId === request.userId;
        const isAdmin = membership.isAdmin() || isCreator;

        if (isAdmin) {
          adminCount++;
        }

        // Get member count for this group
        const groupMembers = await this.groupMemberRepository.findGroupMembers(group.id);

        groups.push({
          id: group.id,
          name: group.name,
          description: group.description,
          visibility: group.visibility,
          creatorId: group.creatorId,
          isCreator,
          isAdmin: isAdmin,
          joinedAt: membership.joinedAt,
          memberCount: groupMembers.length,
        });
      }
    }

    // Sort by most recently joined first
    groups.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());

    return {
      userId: request.userId,
      groups,
      totalGroups: groups.length,
      adminGroups: adminCount,
    };
  }
}
