import mongoose, { Schema, Document } from 'mongoose';
import { IClientRepository } from '@domain/repositories/IClientRepository';
import { Client } from '@domain/entities/Client';

interface ClientDocument extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isEmailConfirmed: boolean;
  emailConfirmationToken?: string;
  emailConfirmationTokenExpiry?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const clientSchema = new Schema<ClientDocument>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  isEmailConfirmed: { type: Boolean, required: true, default: false },
  emailConfirmationToken: { type: String, required: false, index: true },
  emailConfirmationTokenExpiry: { type: Date, required: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: false },
});

const ClientModel = mongoose.model<ClientDocument>('Client', clientSchema);

export class MongoClientRepository implements IClientRepository {
  private toEntity(doc: ClientDocument): Client {
    return new Client({
      id: doc._id,
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      phoneNumber: doc.phoneNumber,
      isEmailConfirmed: doc.isEmailConfirmed,
      emailConfirmationToken: doc.emailConfirmationToken,
      emailConfirmationTokenExpiry: doc.emailConfirmationTokenExpiry,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(client: Client): Promise<void> {
    const doc = new ClientModel({
      _id: client.id,
      email: client.email,
      password: client.password,
      firstName: client.firstName,
      lastName: client.lastName,
      phoneNumber: client.phoneNumber,
      isEmailConfirmed: client.isEmailConfirmed,
      emailConfirmationToken: client.emailConfirmationToken,
      emailConfirmationTokenExpiry: client.emailConfirmationTokenExpiry,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    });
    await doc.save();
  }

  async findById(id: string): Promise<Client | null> {
    const doc = await ClientModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const doc = await ClientModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toEntity(doc) : null;
  }

  async findByEmailConfirmationToken(token: string): Promise<Client | null> {
    const doc = await ClientModel.findOne({ emailConfirmationToken: token });
    return doc ? this.toEntity(doc) : null;
  }

  async update(client: Client): Promise<void> {
    await ClientModel.updateOne(
      { _id: client.id },
      {
        $set: {
          email: client.email,
          password: client.password,
          firstName: client.firstName,
          lastName: client.lastName,
          phoneNumber: client.phoneNumber,
          isEmailConfirmed: client.isEmailConfirmed,
          emailConfirmationToken: client.emailConfirmationToken,
          emailConfirmationTokenExpiry: client.emailConfirmationTokenExpiry,
          updatedAt: client.updatedAt,
        },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await ClientModel.deleteOne({ _id: id });
  }

  async findAll(): Promise<Client[]> {
    const docs = await ClientModel.find();
    return docs.map(doc => this.toEntity(doc));
  }
}
