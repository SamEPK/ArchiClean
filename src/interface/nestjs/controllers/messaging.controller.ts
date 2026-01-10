import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { InMemoryMessageRepository } from '../../../infrastructure/repositories/in-memory/InMemoryMessageRepository';
import { SendMessage } from '../../../application/use-cases/SendMessage';
import { AssignConversation } from '../../../application/use-cases/AssignConversation';
import { TransferConversation } from '../../../application/use-cases/TransferConversation';
import { SendMessageDto } from '../dto/messaging/send-message.dto';
import { AssignConversationDto } from '../dto/messaging/assign-conversation.dto';
import { TransferConversationLegacyDto } from '../dto/messaging/transfer-conversation-legacy.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Client Messaging')
@Controller('messaging')
export class MessagingController {
  private repo = new InMemoryMessageRepository();
  private sender = new SendMessage(this.repo);
  private assigner = new AssignConversation(this.repo);
  private transferer = new TransferConversation(this.repo);

  @Post('send')
  async send(@Body() body: SendMessageDto) {
    await this.sender.execute({
      conversationId: body.conversationId,
      senderId: body.senderId,
      content: body.content,
      senderRole: (body as any).senderRole || 'client',
    });
    return { ok: true };
  }

  @Post('assign')
  async assign(@Body() body: AssignConversationDto) {
    await this.assigner.execute(body.convId, body.advisorId);
    return { ok: true };
  }

  @Post('transfer')
  async transfer(@Body() body: TransferConversationLegacyDto) {
    await this.transferer.execute(body.convId, body.fromAdvisorId, body.toAdvisorId);
    return { ok: true };
  }

  @Get('open')
  async open() {
    const items = await this.repo.findOpenConversations();
    return { ok: true, items };
  }

  // Routes pour les conversations client-advisor
  @Get('conversations/:conversationId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer les messages d\'une conversation (pour clients)' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversation (généralement l\'ID du client)' })
  async getConversationMessages(@Param('conversationId') conversationId: string, @Req() req: Request) {
    try {
      const messages = await this.repo.listMessages(conversationId);
      return { success: true, messages };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get messages',
        messages: []
      };
    }
  }

  @Post('conversations/:conversationId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Envoyer un message dans une conversation (pour clients)' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversation (généralement l\'ID du client)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', example: 'Bonjour, j\'ai une question sur mon crédit...' }
      }
    }
  })
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: { content: string },
    @Req() req: Request
  ) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role || 'client';
      
      await this.sender.execute({
        conversationId,
        senderId: userId,
        content: body.content,
        senderRole: userRole
      });
      
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message'
      };
    }
  }
}
