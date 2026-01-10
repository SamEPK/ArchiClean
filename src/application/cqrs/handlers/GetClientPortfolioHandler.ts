import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClientPortfolioQuery } from '../queries/GetClientPortfolioQuery';
import { DashboardService } from '@application/services/DashboardService';

@QueryHandler(GetClientPortfolioQuery)
export class GetClientPortfolioHandler implements IQueryHandler<GetClientPortfolioQuery> {
  constructor(private readonly dashboardService: DashboardService) {}

  async execute(query: GetClientPortfolioQuery): Promise<any> {
    return this.dashboardService.getAggregatedClientProfile(query.clientId);
  }
}
