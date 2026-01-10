import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  conversationId!: string;

  @IsString()
  senderId!: string;

  @IsString()
  @MinLength(1)
  content!: string;
}
