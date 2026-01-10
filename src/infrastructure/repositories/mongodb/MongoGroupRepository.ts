import mongoose, { Schema, Document } from 'mongoose';
import { Group, GroupVisibility } from '@domain/entities/Group';
import { IGroupRepository } from '@domain/repositories/IGroupRepository';

interface GroupDocument extends Document {
  name: string;
  description?: string;
  creatorId: string;
  visibility: GroupVisibility;
  createdAt: Date;
  updatedAt?: Date;
}

const GroupSchema = new Schema<GroupDocument>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  creatorId: { type: String, required: true },
  visibility: { type: String, enum: ['public', 'private'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export class MongoGroupRepository implements IGroupRepository {
  private get model() {
    if (mongoose.models.Group) {
      return mongoose.models.Group as mongoose.Model<GroupDocument>;
    }
    return mongoose.model<GroupDocument>('Group', GroupSchema);
  }
  private toEntity(doc: GroupDocument): Group {
    return new Group({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      creatorId: doc.creatorId,
      visibility: doc.visibility,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(group: Group): Promise<void> {
    const doc = new this.model({
      _id: group.id,
      name: group.name,
      description: group.description,
      creatorId: group.creatorId,
      visibility: group.visibility,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    });
    await doc.save();
  }

  async findById(id: string): Promise<Group | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByName(name: string): Promise<Group | null> {
    const doc = await this.model.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    return doc ? this.toEntity(doc) : null;
  }

  async findPublicGroups(): Promise<Group[]> {
    const docs = await this.model.find({ visibility: 'public' });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByCreatorId(creatorId: string): Promise<Group[]> {
    const docs = await this.model.find({ creatorId });
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(group: Group): Promise<void> {
    await this.model.findByIdAndUpdate(group.id, {
      name: group.name,
      description: group.description,
      visibility: group.visibility,
      updatedAt: group.updatedAt ?? new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  async findAll(): Promise<Group[]> {
    const docs = await this.model.find();
    return docs.map((doc) => this.toEntity(doc));
  }
}
