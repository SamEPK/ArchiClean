import { Credit } from '../entities/Credit';

export interface ICreditRepository {
  save(credit: Credit): Promise<void>;
  findById(id: string): Promise<Credit | null>;
  findByUserId(userId: string): Promise<Credit[]>;
}
