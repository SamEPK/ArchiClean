import mongoose, { Schema, Document } from 'mongoose';
import { IBankAccountRepository } from '@domain/repositories/IBankAccountRepository';
import { BankAccount } from '@domain/entities/BankAccount';

interface BankAccountDocument extends Document {
  _id: string;
  clientId: string;
  iban: string;
  accountName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const bankAccountSchema = new Schema<BankAccountDocument>({
  _id: { type: String, required: true },
  clientId: { type: String, required: true, index: true },
  iban: { type: String, required: true, unique: true, index: true },
  accountName: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true, default: 'EUR' },
  isActive: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: false },
});

const BankAccountModel = mongoose.model<BankAccountDocument>('BankAccount', bankAccountSchema);

export class MongoBankAccountRepository implements IBankAccountRepository {
  private toEntity(doc: BankAccountDocument): BankAccount {
    return new BankAccount({
      id: doc._id,
      clientId: doc.clientId,
      iban: doc.iban,
      accountName: doc.accountName,
      balance: doc.balance,
      currency: doc.currency,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(account: BankAccount): Promise<void> {
    const doc = new BankAccountModel({
      _id: account.id,
      clientId: account.clientId,
      iban: account.iban,
      accountName: account.accountName,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
    await doc.save();
  }

  async findById(id: string): Promise<BankAccount | null> {
    const doc = await BankAccountModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByIban(iban: string): Promise<BankAccount | null> {
    const doc = await BankAccountModel.findOne({ iban });
    return doc ? this.toEntity(doc) : null;
  }

  async findByClientId(clientId: string): Promise<BankAccount[]> {
    const docs = await BankAccountModel.find({ clientId });
    return docs.map(doc => this.toEntity(doc));
  }

  async update(account: BankAccount): Promise<void> {
    await BankAccountModel.updateOne(
      { _id: account.id },
      {
        $set: {
          accountName: account.accountName,
          balance: account.balance,
          isActive: account.isActive,
          updatedAt: account.updatedAt,
        },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await BankAccountModel.deleteOne({ _id: id });
  }

  async findAll(): Promise<BankAccount[]> {
    const docs = await BankAccountModel.find();
    return docs.map(doc => this.toEntity(doc));
  }
}
