import { IsString } from 'class-validator';

export class AssignConversationDto {
  @IsString()
  convId!: string;

  @IsString()
  advisorId!: string;
}
