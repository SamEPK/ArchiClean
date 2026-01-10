import mongoose, { Schema, Document } from 'mongoose';
import { GroupMember, GroupMemberRole, GroupMemberStatus } from '@domain/entities/GroupMember';
import { IGroupMemberRepository } from '@domain/repositories/IGroupMemberRepository';

interface GroupMemberDocument extends Document {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joinedAt: Date;
  updatedAt?: Date;
}

const GroupMemberSchema = new Schema<GroupMemberDocument>({
  groupId: { type: String, required: true },
  userId: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], required: true },
  status: { type: String, enum: ['active', 'invited', 'banned'], required: true },
  joinedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export class MongoGroupMemberRepository implements IGroupMemberRepository {
  private get model() {
    if (mongoose.models.GroupMember) {
      return mongoose.models.GroupMember as mongoose.Model<GroupMemberDocument>;
    }
    return mongoose.model<GroupMemberDocument>('GroupMember', GroupMemberSchema);
  }

  private toEntity(doc: GroupMemberDocument): GroupMember {
    return new GroupMember({
      id: doc._id.toString(),
      groupId: doc.groupId,
      userId: doc.userId,
      role: doc.role,
      status: doc.status,
      joinedAt: doc.joinedAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(member: GroupMember): Promise<void> {
    const doc = new this.model({
      _id: member.id,
      groupId: member.groupId,
      userId: member.userId,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      updatedAt: member.updatedAt,
    });
    await doc.save();
  }

  async findById(id: string): Promise<GroupMember | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByGroupAndUser(groupId: string, userId: string): Promise<GroupMember | null> {
    const doc = await this.model.findOne({ groupId, userId });
    return doc ? this.toEntity(doc) : null;
  }

  async findGroupMembers(groupId: string): Promise<GroupMember[]> {
    const docs = await this.model.find({ groupId });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findUserGroups(userId: string): Promise<GroupMember[]> {
    const docs = await this.model.find({ userId });
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(member: GroupMember): Promise<void> {
    await this.model.findByIdAndUpdate(member.id, {
      role: member.role,
      status: member.status,
      updatedAt: member.updatedAt ?? new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  async findAll(): Promise<GroupMember[]> {
    const docs = await this.model.find();
    return docs.map((doc) => this.toEntity(doc));
  }
}
