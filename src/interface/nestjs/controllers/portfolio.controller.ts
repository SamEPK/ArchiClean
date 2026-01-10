import { Controller, Get, Param, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetPortfolioUseCase } from '@application/use-cases/GetPortfolioUseCase';

@ApiTags('Portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(
    @Inject('GetPortfolioUseCase')
    private readonly getPortfolioUseCase: GetPortfolioUseCase,
  ) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Récupérer le portfolio', description: 'Obtenir le portfolio complet d\'un utilisateur avec toutes ses actions' })
  @ApiResponse({ status: 200, description: 'Portfolio de l\'utilisateur avec la liste des actions détenues' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async getPortfolio(@Param('userId') userId: string) {
    try {
      return await this.getPortfolioUseCase.execute({ userId });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to retrieve portfolio');
    }
  }
}
