import mongoose, { Schema, Document } from 'mongoose';
import { Portfolio } from '@domain/entities/Portfolio';
import { IPortfolioRepository } from '@domain/repositories/IPortfolioRepository';

interface PortfolioDocument extends Document {
  userId: string;
  stockId: string;
  quantity: number;
  averagePurchasePrice: number;
}

const PortfolioSchema = new Schema<PortfolioDocument>({
  userId: { type: String, required: true },
  stockId: { type: String, required: true },
  quantity: { type: Number, required: true },
  averagePurchasePrice: { type: Number, required: true },
});

PortfolioSchema.index({ userId: 1, stockId: 1 }, { unique: true });

const PortfolioModel = mongoose.model<PortfolioDocument>(
  'Portfolio',
  PortfolioSchema,
);

export class MongoPortfolioRepository implements IPortfolioRepository {
  private toEntity(doc: PortfolioDocument): Portfolio {
    return new Portfolio(
      doc.userId,
      doc.stockId,
      doc.quantity,
      doc.averagePurchasePrice,
    );
  }

  async save(portfolio: Portfolio): Promise<Portfolio> {
    const doc = await PortfolioModel.findOneAndUpdate(
      { userId: portfolio.userId, stockId: portfolio.stockId },
      {
        quantity: portfolio.quantity,
        averagePurchasePrice: portfolio.averagePurchasePrice,
      },
      { upsert: true, new: true },
    );
    return this.toEntity(doc);
  }

  async findByUserIdAndStockId(
    userId: string,
    stockId: string,
  ): Promise<Portfolio | null> {
    const doc = await PortfolioModel.findOne({ userId, stockId });
    return doc ? this.toEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Portfolio[]> {
    const docs = await PortfolioModel.find({ userId });
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(portfolio: Portfolio): Promise<Portfolio> {
    const doc = await PortfolioModel.findOneAndUpdate(
      { userId: portfolio.userId, stockId: portfolio.stockId },
      {
        quantity: portfolio.quantity,
        averagePurchasePrice: portfolio.averagePurchasePrice,
      },
      { new: true },
    );
    if (!doc) {
      throw new Error('Portfolio not found');
    }
    return this.toEntity(doc);
  }

  async delete(userId: string, stockId: string): Promise<void> {
    await PortfolioModel.deleteOne({ userId, stockId });
  }
}
