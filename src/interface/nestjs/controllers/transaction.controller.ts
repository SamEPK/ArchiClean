import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TransferFundsUseCase } from '@application/use-cases/TransferFundsUseCase';
import { DepositFundsUseCase } from '@application/use-cases/DepositFundsUseCase';
import { WithdrawFundsUseCase } from '@application/use-cases/WithdrawFundsUseCase';
import { GetTransactionHistoryUseCase } from '@application/use-cases/GetTransactionHistoryUseCase';
import { TransferFundsDto } from '../dto/transaction/transfer-funds.dto';
import { DepositFundsDto } from '../dto/transaction/deposit-funds.dto';
import { WithdrawFundsDto } from '../dto/transaction/withdraw-funds.dto';
import { TransactionHistoryQueryDto } from '../dto/transaction/transaction-history-query.dto';

@ApiTags('Clients')
@Controller('transactions')
export class TransactionController {
  constructor(
    private transferFundsUseCase: TransferFundsUseCase,
    private depositFundsUseCase: DepositFundsUseCase,
    private withdrawFundsUseCase: WithdrawFundsUseCase,
    private getTransactionHistoryUseCase: GetTransactionHistoryUseCase
  ) {}

  @Post('transfer')
  @ApiOperation({
    summary: 'Transférer des fonds',
    description: 'Effectuer un virement d\'un compte bancaire vers un autre'
  })
  @ApiResponse({ status: 201, description: 'Virement effectué avec succès' })
  @ApiResponse({ status: 400, description: 'Solde insuffisant ou comptes invalides' })
  @ApiBody({
    description: 'Informations du virement',
    schema: {
      type: 'object',
      required: ['fromAccountId', 'toAccountId', 'amount'],
      properties: {
        fromAccountId: { type: 'string', example: 'acc-123', description: 'Compte source' },
        toAccountId: { type: 'string', example: 'acc-456', description: 'Compte destination' },
        amount: { type: 'number', example: 100.50, description: 'Montant à transférer' },
        description: { type: 'string', example: 'Remboursement', description: 'Description du virement' },
      },
    },
  })
  async transfer(@Body() body: TransferFundsDto) {
    try {
      const transaction = await this.transferFundsUseCase.execute(
        body.fromAccountId,
        body.toAccountId,
        body.amount,
        body.description
      );
      return {
        success: true,
        message: 'Transfer completed successfully',
        transaction: {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Transfer failed',
      };
    }
  }

  @Post('deposit')
  @ApiOperation({
    summary: 'Déposer des fonds',
    description: 'Effectuer un dépôt sur un compte bancaire'
  })
  @ApiResponse({ status: 201, description: 'Dépôt effectué avec succès' })
  @ApiResponse({ status: 400, description: 'Compte invalide' })
  @ApiBody({
    description: 'Informations du dépôt',
    schema: {
      type: 'object',
      required: ['accountId', 'amount'],
      properties: {
        accountId: { type: 'string', example: 'acc-123' },
        amount: { type: 'number', example: 500, description: 'Montant à déposer' },
        description: { type: 'string', example: 'Dépôt initial' },
      },
    },
  })
  async deposit(@Body() body: DepositFundsDto) {
    try {
      const transaction = await this.depositFundsUseCase.execute(
        body.accountId,
        body.amount,
        body.description
      );
      return {
        success: true,
        message: 'Deposit completed successfully',
        transaction: {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Deposit failed',
      };
    }
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Retirer des fonds',
    description: 'Effectuer un retrait depuis un compte bancaire'
  })
  @ApiResponse({ status: 201, description: 'Retrait effectué avec succès' })
  @ApiResponse({ status: 400, description: 'Solde insuffisant ou compte invalide' })
  @ApiBody({
    description: 'Informations du retrait',
    schema: {
      type: 'object',
      required: ['accountId', 'amount'],
      properties: {
        accountId: { type: 'string', example: 'acc-123' },
        amount: { type: 'number', example: 50, description: 'Montant à retirer' },
        description: { type: 'string', example: 'Retrait DAB' },
      },
    },
  })
  async withdraw(@Body() body: WithdrawFundsDto) {
    try {
      const transaction = await this.withdrawFundsUseCase.execute(
        body.accountId,
        body.amount,
        body.description
      );
      return {
        success: true,
        message: 'Withdrawal completed successfully',
        transaction: {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Withdrawal failed',
      };
    }
  }

  @Get('account/:accountId')
  @ApiOperation({
    summary: 'Historique des transactions',
    description: 'Récupérer l\'historique des transactions d\'un compte'
  })
  @ApiResponse({ status: 200, description: 'Historique récupéré' })
  @ApiParam({ name: 'accountId', description: 'ID du compte bancaire' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre de transactions (par défaut: 50)' })
  async getHistory(@Param('accountId') accountId: string, @Query() query: TransactionHistoryQueryDto) {
    try {
      const transactions = await this.getTransactionHistoryUseCase.execute(
        accountId,
        query.limit ?? 50
      );
      return {
        success: true,
        count: transactions.length,
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          fromAccountId: t.fromAccountId,
          toAccountId: t.toAccountId,
          amount: t.amount,
          description: t.description,
          status: t.status,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve history',
      };
    }
  }

  @Get('history/:clientId')
  @ApiOperation({
    summary: 'Historique des transactions du client',
    description: 'Récupérer l\'historique de toutes les transactions de tous les comptes d\'un client'
  })
  @ApiResponse({ status: 200, description: 'Historique récupéré' })
  @ApiParam({ name: 'clientId', description: 'ID du client' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre de transactions (par défaut: 50)' })
  async getClientHistory(@Param('clientId') clientId: string, @Query() query: TransactionHistoryQueryDto) {
    try {
      // Get all transactions for all client accounts
      const transactions = await this.getTransactionHistoryUseCase.execute(
        clientId,
        query.limit ?? 100
      );
      return {
        success: true,
        count: transactions.length,
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          fromAccountId: t.fromAccountId,
          toAccountId: t.toAccountId,
          amount: t.amount,
          description: t.description,
          status: t.status,
          createdAt: t.createdAt,
          completedAt: t.completedAt,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve client history',
      };
    }
  }
}
