import mongoose, { Schema, Document } from 'mongoose';
import { SavingsAccount } from '@domain/entities/SavingsAccount';
import { ISavingsAccountRepository } from '@domain/repositories/ISavingsAccountRepository';

interface SavingsAccountDocument extends Document {
  accountId: string;
  interestRate: number;
  lastInterestDate: Date;
  createdAt: Date;
}

const SavingsAccountSchema = new Schema<SavingsAccountDocument>({
  accountId: { type: String, required: true, unique: true },
  interestRate: { type: Number, required: true },
  lastInterestDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SavingsAccountModel = mongoose.model<SavingsAccountDocument>(
  'SavingsAccount',
  SavingsAccountSchema,
);

export class MongoSavingsAccountRepository
  implements ISavingsAccountRepository
{
  private toEntity(doc: SavingsAccountDocument): SavingsAccount {
    return new SavingsAccount(
      doc._id.toString(),
      doc.accountId,
      doc.interestRate,
      doc.lastInterestDate,
      doc.createdAt,
    );
  }

  async save(savingsAccount: SavingsAccount): Promise<SavingsAccount> {
    const doc = new SavingsAccountModel({
      _id: savingsAccount.id,
      accountId: savingsAccount.accountId,
      interestRate: savingsAccount.interestRate,
      lastInterestDate: savingsAccount.lastInterestDate,
      createdAt: savingsAccount.createdAt,
    });
    await doc.save();
    return this.toEntity(doc);
  }

  async findById(id: string): Promise<SavingsAccount | null> {
    const doc = await SavingsAccountModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByAccountId(accountId: string): Promise<SavingsAccount | null> {
    const doc = await SavingsAccountModel.findOne({ accountId });
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(): Promise<SavingsAccount[]> {
    const docs = await SavingsAccountModel.find();
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(savingsAccount: SavingsAccount): Promise<SavingsAccount> {
    const doc = await SavingsAccountModel.findByIdAndUpdate(
      savingsAccount.id,
      {
        interestRate: savingsAccount.interestRate,
        lastInterestDate: savingsAccount.lastInterestDate,
      },
      { new: true },
    );
    if (!doc) {
      throw new Error('Savings account not found');
    }
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await SavingsAccountModel.findByIdAndDelete(id);
  }

  async findAccountsNeedingInterest(
    currentDate: Date,
  ): Promise<SavingsAccount[]> {
    const oneDayAgo = new Date(currentDate);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const docs = await SavingsAccountModel.find({
      lastInterestDate: { $lte: oneDayAgo },
    });
    return docs.map((doc) => this.toEntity(doc));
  }
}
