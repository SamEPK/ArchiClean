import { IsString } from 'class-validator';

export class TransferConversationLegacyDto {
  @IsString()
  convId!: string;

  @IsString()
  fromAdvisorId!: string;

  @IsString()
  toAdvisorId!: string;
}
