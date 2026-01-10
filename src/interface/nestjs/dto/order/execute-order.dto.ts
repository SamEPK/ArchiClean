import { IsNumber } from 'class-validator';

export class ExecuteOrderDto {
  @IsNumber()
  executionPrice!: number;
}
