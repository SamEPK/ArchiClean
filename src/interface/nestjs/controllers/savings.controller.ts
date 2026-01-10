import { Controller, Post, Get, Body, Param, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OpenSavingsAccountUseCase } from '@application/use-cases/OpenSavingsAccountUseCase';
import { ApplyDailyInterestUseCase } from '@application/use-cases/ApplyDailyInterestUseCase';
import { GetSavingsAccountsByClientUseCase } from '@application/use-cases/GetSavingsAccountsByClientUseCase';
import { OpenSavingsDto } from '../dto/savings/open-savings.dto';
import { ApplyDailyInterestDto } from '../dto/savings/apply-daily-interest.dto';

@ApiTags('Savings')
@Controller('savings')
export class SavingsController {
  constructor(
    @Inject('OpenSavingsAccountUseCase')
    private readonly openSavingsAccountUseCase: OpenSavingsAccountUseCase,
    @Inject('ApplyDailyInterestUseCase')
    private readonly applyDailyInterestUseCase: ApplyDailyInterestUseCase,
    @Inject('GetSavingsAccountsByClientUseCase')
    private readonly getSavingsAccountsByClientUseCase: GetSavingsAccountsByClientUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Ouvrir un compte épargne', description: 'Créer un nouveau compte d\'épargne avec taux d\'intérêt quotidien' })
  @ApiResponse({ status: 201, description: 'Compte épargne créé avec succès' })
  @ApiResponse({ status: 400, description: 'Compte bancaire introuvable ou données invalides' })
  async openSavingsAccount(
    @Body() body: OpenSavingsDto,
  ) {
    try {
      return await this.openSavingsAccountUseCase.execute(body);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid savings account request');
    }
  }

  @Post('apply-interest')
  @ApiOperation({ summary: 'Appliquer les intérêts quotidiens', description: 'Calculer et appliquer les intérêts quotidiens à tous les comptes épargne' })
  @ApiResponse({ status: 200, description: 'Intérêts appliqués avec succès' })
  async applyDailyInterest(@Body() body: ApplyDailyInterestDto) {
    try {
      return await this.applyDailyInterestUseCase.execute({
        currentDate: body.currentDate ? new Date(body.currentDate) : undefined,
      });
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to apply daily interest');
    }
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Récupérer les comptes épargne d\'un client', description: 'Obtenir tous les comptes épargne associés aux comptes bancaires d\'un client' })
  @ApiResponse({ status: 200, description: 'Liste des comptes épargne du client' })
  async getSavingsAccountsByClient(@Param('clientId') clientId: string) {
    try {
      const accounts = await this.getSavingsAccountsByClientUseCase.execute(clientId);
      return {
        success: true,
        accounts: accounts.map(acc => ({
          id: acc.id,
          accountId: acc.accountId,
          interestRate: acc.interestRate,
          balance: acc.balance,
          lastInterestDate: acc.lastInterestDate,
          createdAt: acc.createdAt,
          isActive: true
        }))
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to get savings accounts');
    }
  }
}
