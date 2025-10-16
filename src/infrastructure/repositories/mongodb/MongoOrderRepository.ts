import mongoose, { Schema, Document } from 'mongoose';
import { Order, OrderType, OrderStatus } from '@domain/entities/Order';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';

interface OrderDocument extends Document {
  userId: string;
  stockId: string;
  type: OrderType;
  quantity: number;
  price: number;
  status: OrderStatus;
  createdAt: Date;
  executedAt?: Date;
}

const OrderSchema = new Schema<OrderDocument>({
  userId: { type: String, required: true },
  stockId: { type: String, required: true },
  type: { type: String, enum: Object.values(OrderType), required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: Object.values(OrderStatus), required: true },
  createdAt: { type: Date, default: Date.now },
  executedAt: { type: Date },
});

const OrderModel = mongoose.model<OrderDocument>('Order', OrderSchema);

export class MongoOrderRepository implements IOrderRepository {
  private toEntity(doc: OrderDocument): Order {
    return new Order(
      doc._id.toString(),
      doc.userId,
      doc.stockId,
      doc.type,
      doc.quantity,
      doc.price,
      doc.status,
      doc.createdAt,
      doc.executedAt,
    );
  }

  async save(order: Order): Promise<Order> {
    const doc = new OrderModel({
      _id: order.id,
      userId: order.userId,
      stockId: order.stockId,
      type: order.type,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt,
      executedAt: order.executedAt,
    });
    await doc.save();
    return this.toEntity(doc);
  }

  async findById(id: string): Promise<Order | null> {
    const doc = await OrderModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ userId });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByStockId(stockId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ stockId });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const docs = await OrderModel.find({ status });
    return docs.map((doc) => this.toEntity(doc));
  }

  async findPendingOrdersByStock(
    stockId: string,
    type: OrderType,
  ): Promise<Order[]> {
    const docs = await OrderModel.find({
      stockId,
      type,
      status: OrderStatus.PENDING,
    });
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(order: Order): Promise<Order> {
    const doc = await OrderModel.findByIdAndUpdate(
      order.id,
      {
        status: order.status,
        executedAt: order.executedAt,
      },
      { new: true },
    );
    if (!doc) {
      throw new Error('Order not found');
    }
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await OrderModel.findByIdAndDelete(id);
  }
}
