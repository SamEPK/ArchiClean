import { IsString, MinLength } from 'class-validator';

export class TransferConversationDto {
  @IsString()
  @MinLength(1)
  toAdvisorId!: string;
}
