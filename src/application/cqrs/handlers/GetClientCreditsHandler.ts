import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClientCreditsQuery } from '../queries/GetClientCreditsQuery';
import { ICreditRepository } from '@domain/repositories/ICreditRepository';
import { Inject } from '@nestjs/common';

@QueryHandler(GetClientCreditsQuery)
export class GetClientCreditsHandler implements IQueryHandler<GetClientCreditsQuery> {
  constructor(@Inject('ICreditRepository') private readonly creditRepo: ICreditRepository) {}

  async execute(query: GetClientCreditsQuery): Promise<any> {
    return this.creditRepo.findByUserId(query.clientId);
  }
}
