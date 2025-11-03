import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RegisterClientUseCase } from '@application/use-cases/RegisterClientUseCase';
import { ConfirmEmailUseCase } from '@application/use-cases/ConfirmEmailUseCase';
import { AuthenticateClientUseCase } from '@application/use-cases/AuthenticateClientUseCase';
import { CreateBankAccountUseCase } from '@application/use-cases/CreateBankAccountUseCase';
import { DeleteBankAccountUseCase } from '@application/use-cases/DeleteBankAccountUseCase';
import { UpdateBankAccountNameUseCase } from '@application/use-cases/UpdateBankAccountNameUseCase';
import { ListBankAccountsUseCase } from '@application/use-cases/ListBankAccountsUseCase';

@Controller('clients')
export class ClientController {
  constructor(
    private registerClientUseCase: RegisterClientUseCase,
    private confirmEmailUseCase: ConfirmEmailUseCase,
    private authenticateClientUseCase: AuthenticateClientUseCase,
    private createBankAccountUseCase: CreateBankAccountUseCase,
    private deleteBankAccountUseCase: DeleteBankAccountUseCase,
    private updateBankAccountNameUseCase: UpdateBankAccountNameUseCase,
    private listBankAccountsUseCase: ListBankAccountsUseCase
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    }
  ) {
    try {
      const result = await this.registerClientUseCase.execute(
        body.email,
        body.password,
        body.firstName,
        body.lastName,
        body.phoneNumber
      );

      return {
        success: true,
        message: 'Registration successful. Please check your email to confirm your account.',
        clientId: result.client.id,
        email: result.client.email,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    const result = await this.confirmEmailUseCase.execute(token);
    return result;
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authenticateClientUseCase.execute(body.email, body.password);

    if (result.success && result.client) {
      return {
        success: true,
        message: result.message,
        client: {
          id: result.client.id,
          email: result.client.email,
          firstName: result.client.firstName,
          lastName: result.client.lastName,
          phoneNumber: result.client.phoneNumber,
        },
      };
    }

    return {
      success: false,
      message: result.message,
    };
  }

  @Post(':clientId/accounts')
  async createBankAccount(
    @Param('clientId') clientId: string,
    @Body() body: { accountName: string; initialBalance?: number; currency?: string }
  ) {
    try {
      const account = await this.createBankAccountUseCase.execute(
        clientId,
        body.accountName,
        body.initialBalance,
        body.currency
      );

      return {
        success: true,
        message: 'Bank account created successfully',
        account: {
          id: account.id,
          iban: account.iban,
          accountName: account.accountName,
          balance: account.balance,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create bank account',
      };
    }
  }

  @Get(':clientId/accounts')
  async listBankAccounts(@Param('clientId') clientId: string, @Query('includeInactive') includeInactive?: string) {
    const accounts = await this.listBankAccountsUseCase.execute(clientId, includeInactive === 'true');

    return {
      success: true,
      count: accounts.length,
      accounts: accounts.map(account => ({
        id: account.id,
        iban: account.iban,
        accountName: account.accountName,
        balance: account.balance,
        currency: account.currency,
        isActive: account.isActive,
        createdAt: account.createdAt,
      })),
    };
  }

  @Put(':clientId/accounts/:accountId')
  async updateBankAccountName(
    @Param('clientId') clientId: string,
    @Param('accountId') accountId: string,
    @Body() body: { accountName: string }
  ) {
    try {
      const account = await this.updateBankAccountNameUseCase.execute(accountId, clientId, body.accountName);

      return {
        success: true,
        message: 'Account name updated successfully',
        account: {
          id: account.id,
          iban: account.iban,
          accountName: account.accountName,
          balance: account.balance,
          currency: account.currency,
          isActive: account.isActive,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update account name',
      };
    }
  }

  @Delete(':clientId/accounts/:accountId')
  async deleteBankAccount(@Param('clientId') clientId: string, @Param('accountId') accountId: string) {
    const result = await this.deleteBankAccountUseCase.execute(accountId, clientId);
    return result;
  }
}
