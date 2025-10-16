import mongoose, { Schema, Document } from 'mongoose';
import { Stock } from '@domain/entities/Stock';
import { IStockRepository } from '@domain/repositories/IStockRepository';

interface StockDocument extends Document {
  symbol: string;
  name: string;
  companyName: string;
  isAvailable: boolean;
  createdAt: Date;
}

const StockSchema = new Schema<StockDocument>({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const StockModel = mongoose.model<StockDocument>('Stock', StockSchema);

export class MongoStockRepository implements IStockRepository {
  private toEntity(doc: StockDocument): Stock {
    return new Stock(
      doc._id.toString(),
      doc.symbol,
      doc.name,
      doc.companyName,
      doc.isAvailable,
      doc.createdAt,
    );
  }

  async save(stock: Stock): Promise<Stock> {
    const doc = new StockModel({
      _id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      companyName: stock.companyName,
      isAvailable: stock.isAvailable,
      createdAt: stock.createdAt,
    });
    await doc.save();
    return this.toEntity(doc);
  }

  async findById(id: string): Promise<Stock | null> {
    const doc = await StockModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findBySymbol(symbol: string): Promise<Stock | null> {
    const doc = await StockModel.findOne({ symbol });
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(): Promise<Stock[]> {
    const docs = await StockModel.find();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findAvailable(): Promise<Stock[]> {
    const docs = await StockModel.find({ isAvailable: true });
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(stock: Stock): Promise<Stock> {
    const doc = await StockModel.findByIdAndUpdate(
      stock.id,
      {
        isAvailable: stock.isAvailable,
      },
      { new: true },
    );
    if (!doc) {
      throw new Error('Stock not found');
    }
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await StockModel.findByIdAndDelete(id);
  }
}
