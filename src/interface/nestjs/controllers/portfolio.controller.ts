import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetPortfolioUseCase } from '@application/use-cases/GetPortfolioUseCase';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(
    @Inject('GetPortfolioUseCase')
    private readonly getPortfolioUseCase: GetPortfolioUseCase,
  ) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user portfolio' })
  @ApiResponse({ status: 200, description: 'User portfolio with stocks' })
  async getPortfolio(@Param('userId') userId: string) {
    return await this.getPortfolioUseCase.execute({ userId });
  }
}
