import { IsString, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { OrderType } from '@domain/entities/Order';

export class PlaceOrderDto {
  @IsString()
  userId!: string;

  @IsString()
  accountId!: string;

  @IsString()
  stockId!: string;

  @IsEnum(OrderType)
  type!: OrderType;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  price!: number;
}
