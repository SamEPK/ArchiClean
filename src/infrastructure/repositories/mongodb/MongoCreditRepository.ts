import mongoose, { Schema, Document } from 'mongoose';
import { ICreditRepository } from '@domain/repositories/ICreditRepository';
import { Credit } from '@domain/entities/Credit';

interface CreditDocument extends Document {
  _id: string;
  userId: string;
  amount: number;
  annualRate: number;
  insuranceRate: number;
  monthlyPayment: number;
  remainingBalance: number;
  createdAt: Date;
}

const creditSchema = new Schema<CreditDocument>({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  annualRate: { type: Number, required: true, min: 0 },
  insuranceRate: { type: Number, required: true, min: 0 },
  monthlyPayment: { type: Number, required: true, default: 0 },
  remainingBalance: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

// Index composé pour recherches optimisées
creditSchema.index({ userId: 1, createdAt: -1 });
creditSchema.index({ remainingBalance: 1 });

const CreditModel = mongoose.model<CreditDocument>('Credit', creditSchema);

export class MongoCreditRepository implements ICreditRepository {
  private toEntity(doc: CreditDocument): Credit {
    return new Credit({
      id: doc._id,
      userId: doc.userId,
      amount: doc.amount,
      annualRate: doc.annualRate,
      insuranceRate: doc.insuranceRate,
      monthlyPayment: doc.monthlyPayment,
      remainingBalance: doc.remainingBalance,
      createdAt: doc.createdAt,
    });
  }

  async save(credit: Credit): Promise<void> {
    const existingDoc = await CreditModel.findById(credit.id);
    
    if (existingDoc) {
      // Update existing credit
      await CreditModel.updateOne(
        { _id: credit.id },
        {
          $set: {
            monthlyPayment: credit.monthlyPayment,
            remainingBalance: credit.remainingBalance,
          }
        }
      );
    } else {
      // Create new credit
      const doc = new CreditModel({
        _id: credit.id,
        userId: credit.userId,
        amount: credit.amount,
        annualRate: credit.annualRate,
        insuranceRate: credit.insuranceRate,
        monthlyPayment: credit.monthlyPayment,
        remainingBalance: credit.remainingBalance,
        createdAt: credit.createdAt,
      });
      await doc.save();
    }
  }

  async findById(id: string): Promise<Credit | null> {
    const doc = await CreditModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Credit[]> {
    const docs = await CreditModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(doc => this.toEntity(doc));
  }
}
