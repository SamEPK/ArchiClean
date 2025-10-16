import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OpenSavingsAccountUseCase } from '@application/use-cases/OpenSavingsAccountUseCase';
import { ApplyDailyInterestUseCase } from '@application/use-cases/ApplyDailyInterestUseCase';

@ApiTags('savings')
@Controller('savings')
export class SavingsController {
  constructor(
    @Inject('OpenSavingsAccountUseCase')
    private readonly openSavingsAccountUseCase: OpenSavingsAccountUseCase,
    @Inject('ApplyDailyInterestUseCase')
    private readonly applyDailyInterestUseCase: ApplyDailyInterestUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Open a new savings account' })
  @ApiResponse({ status: 201, description: 'Savings account created' })
  async openSavingsAccount(
    @Body() body: { accountId: string; interestRate: number },
  ) {
    return await this.openSavingsAccountUseCase.execute(body);
  }

  @Post('apply-interest')
  @ApiOperation({ summary: 'Apply daily interest to all accounts' })
  @ApiResponse({ status: 200, description: 'Interest applied' })
  async applyDailyInterest(@Body() body: { currentDate?: string }) {
    return await this.applyDailyInterestUseCase.execute({
      currentDate: body.currentDate ? new Date(body.currentDate) : undefined,
    });
  }
}
