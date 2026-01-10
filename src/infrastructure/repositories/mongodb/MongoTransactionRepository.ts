import mongoose, { Schema, Document } from 'mongoose';
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { Transaction, TransactionType, TransactionStatus } from '@domain/entities/Transaction';

interface TransactionDocument extends Document {
  _id: string;
  type: TransactionType;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

const transactionSchema = new Schema<TransactionDocument>({
  _id: { type: String, required: true },
  type: { type: String, required: true, enum: ['transfer', 'deposit', 'withdrawal'], index: true },
  fromAccountId: { type: String, required: false, default: null, index: true },
  toAccountId: { type: String, required: false, default: null, index: true },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  status: { type: String, required: true, enum: ['pending', 'completed', 'failed'], default: 'pending', index: true },
  createdAt: { type: Date, required: true, default: Date.now, index: true },
  completedAt: { type: Date, required: false },
  failureReason: { type: String, required: false },
});

// Index composé pour recherches par compte
transactionSchema.index({ fromAccountId: 1, createdAt: -1 });
transactionSchema.index({ toAccountId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

const TransactionModel = mongoose.model<TransactionDocument>('Transaction', transactionSchema);

export class MongoTransactionRepository implements ITransactionRepository {
  private toEntity(doc: TransactionDocument): Transaction {
    return new Transaction(
      doc._id,
      doc.type,
      doc.fromAccountId,
      doc.toAccountId,
      doc.amount,
      doc.description,
      doc.status,
      doc.createdAt,
      doc.completedAt,
      doc.failureReason
    );
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const existingDoc = await TransactionModel.findById(transaction.id);
    
    if (existingDoc) {
      // Update existing transaction
      await TransactionModel.updateOne(
        { _id: transaction.id },
        {
          $set: {
            status: transaction.status,
            completedAt: transaction.completedAt,
            failureReason: transaction.failureReason,
          }
        }
      );
    } else {
      // Create new transaction
      const doc = new TransactionModel({
        _id: transaction.id,
        type: transaction.type,
        fromAccountId: transaction.fromAccountId,
        toAccountId: transaction.toAccountId,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        failureReason: transaction.failureReason,
      });
      await doc.save();
    }

    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    const doc = await TransactionModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByAccountId(accountId: string, limit?: number): Promise<Transaction[]> {
    const query = TransactionModel.find({
      $or: [
        { fromAccountId: accountId },
        { toAccountId: accountId }
      ]
    }).sort({ createdAt: -1 });

    if (limit) {
      query.limit(limit);
    }

    const docs = await query.exec();
    return docs.map(doc => this.toEntity(doc));
  }

  async findAll(): Promise<Transaction[]> {
    const docs = await TransactionModel.find().sort({ createdAt: -1 });
    return docs.map(doc => this.toEntity(doc));
  }
}
