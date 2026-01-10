import mongoose, { Schema, Document } from 'mongoose';
import { IAdminRepository } from '@domain/repositories/IAdminRepository';
import { BankDirector } from '@domain/entities/BankDirector';
import { Advisor } from '@domain/entities/Advisor';

interface DirectorDocument extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

interface AdvisorDocument extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

interface BannedClientDocument extends Document {
  _id: string;
  clientId: string;
  bannedAt: Date;
}

const directorSchema = new Schema<DirectorDocument>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

const advisorSchema = new Schema<AdvisorDocument>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

const bannedClientSchema = new Schema<BannedClientDocument>({
  _id: { type: String, required: true },
  clientId: { type: String, required: true, unique: true, index: true },
  bannedAt: { type: Date, required: true, default: Date.now },
});

const DirectorModel = mongoose.model<DirectorDocument>('Director', directorSchema);
const AdvisorModel = mongoose.model<AdvisorDocument>('AdminAdvisor', advisorSchema);
const BannedClientModel = mongoose.model<BannedClientDocument>('BannedClient', bannedClientSchema);

export class MongoAdminRepository implements IAdminRepository {
  private toDirectorEntity(doc: DirectorDocument): BankDirector {
    return new BankDirector({
      id: doc._id,
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      createdAt: doc.createdAt,
    });
  }

  private toAdvisorEntity(doc: AdvisorDocument): Advisor {
    return new Advisor({
      id: doc._id,
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      createdAt: doc.createdAt,
    });
  }

  async createDirector(director: BankDirector): Promise<void> {
    const doc = new DirectorModel({
      _id: director.id,
      email: director.email,
      password: director.password,
      firstName: director.firstName,
      lastName: director.lastName,
      createdAt: director.createdAt,
    });
    await doc.save();
  }

  async findDirectorByEmail(email: string): Promise<BankDirector | null> {
    const doc = await DirectorModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toDirectorEntity(doc) : null;
  }

  async createAdvisor(advisor: Advisor): Promise<void> {
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

  async findAdvisorByEmail(email: string): Promise<Advisor | null> {
    const doc = await AdvisorModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toAdvisorEntity(doc) : null;
  }

  async banClient(clientId: string): Promise<void> {
    const existing = await BannedClientModel.findOne({ clientId });
    
    if (!existing) {
      const doc = new BannedClientModel({
        _id: `ban-${clientId}-${Date.now()}`,
        clientId: clientId,
        bannedAt: new Date(),
      });
      await doc.save();
    }
  }
}
