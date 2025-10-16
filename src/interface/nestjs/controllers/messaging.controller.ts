import { Controller, Post, Body, Get } from '@nestjs/common';
import { InMemoryMessageRepository } from '../../../infrastructure/repositories/in-memory/InMemoryMessageRepository';
import { SendMessage } from '../../../application/use-cases/SendMessage';
import { AssignConversation } from '../../../application/use-cases/AssignConversation';
import { TransferConversation } from '../../../application/use-cases/TransferConversation';

@Controller('messaging')
export class MessagingController {
  private repo = new InMemoryMessageRepository();
  private sender = new SendMessage(this.repo);
  private assigner = new AssignConversation(this.repo);
  private transferer = new TransferConversation(this.repo);

  @Post('send')
  async send(@Body() body: { conversationId: string; senderId: string; content: string }) {
    await this.sender.execute(body.conversationId, body.senderId, body.content);
    return { ok: true };
  }

  @Post('assign')
  async assign(@Body() body: { convId: string; advisorId: string }) {
    await this.assigner.execute(body.convId, body.advisorId);
    return { ok: true };
  }

  @Post('transfer')
  async transfer(@Body() body: { convId: string; fromAdvisorId: string; toAdvisorId: string }) {
    await this.transferer.execute(body.convId, body.fromAdvisorId, body.toAdvisorId);
    return { ok: true };
  }

  @Get('open')
  async open() {
    const items = await this.repo.findOpenConversations();
    return { ok: true, items };
  }
}
