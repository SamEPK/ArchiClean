import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOpenConversationsQuery } from '../queries/ListOpenConversationsQuery';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { Inject } from '@nestjs/common';

@QueryHandler(ListOpenConversationsQuery)
export class ListOpenConversationsHandler implements IQueryHandler<ListOpenConversationsQuery> {
  constructor(@Inject('IMessageRepository') private readonly messageRepo: IMessageRepository) {}

  async execute(): Promise<any> {
    return this.messageRepo.findOpenConversations();
  }
}
