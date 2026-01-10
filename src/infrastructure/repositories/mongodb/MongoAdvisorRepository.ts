import mongoose, { Schema, Document } from 'mongoose';
import { IAdvisorRepository } from '@domain/repositories/IAdvisorRepository';
import { Advisor } from '@domain/entities/Advisor';

interface AdvisorDocument extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

const advisorSchema = new Schema<AdvisorDocument>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

// Index pour recherches optimisées
advisorSchema.index({ email: 1 });
advisorSchema.index({ lastName: 1, firstName: 1 });

const AdvisorModel = mongoose.model<AdvisorDocument>('Advisor', advisorSchema);

export class MongoAdvisorRepository implements IAdvisorRepository {
  private toEntity(doc: AdvisorDocument): Advisor {
    return new Advisor({
      id: doc._id,
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      createdAt: doc.createdAt,
    });
  }

  async create(advisor: Advisor): Promise<void> {
    const doc = new AdvisorModel({
      _id: advisor.id,
      email: advisor.email,
      password: advisor.password,
      firstName: advisor.firstName,
      lastName: advisor.lastName,
      createdAt: advisor.createdAt,
    });
    await doc.save();
  }

  async findById(id: string): Promise<Advisor | null> {
    const doc = await AdvisorModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<Advisor | null> {
    const doc = await AdvisorModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(): Promise<Advisor[]> {
    const docs = await AdvisorModel.find().sort({ lastName: 1, firstName: 1 });
    return docs.map(doc => this.toEntity(doc));
  }

  async update(advisor: Advisor): Promise<void> {
    await AdvisorModel.updateOne(
      { _id: advisor.id },
      {
        $set: {
          email: advisor.email,
          password: advisor.password,
          firstName: advisor.firstName,
          lastName: advisor.lastName,
        }
      }
    );
  }
}
