import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { savingsRoutes } from './routes/savingsRoutes';
import { stockRoutes } from './routes/stockRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { portfolioRoutes } from './routes/portfolioRoutes';
import { authRoutes } from './routes/authRoutes';
import { clientRoutes } from './routes/clientRoutes';
import { transactionRoutes } from './routes/transactionRoutes';
import { directorRoutes } from './routes/directorRoutes';
import { advisorRoutes } from './routes/advisorRoutes';
import { systemRoutes } from './routes/systemRoutes';
import { startBankingScheduler } from '@infrastructure/scheduler/BankingScheduler';
import { getNotificationService } from '@infrastructure/services/NotificationService';

const fastify = Fastify({
  logger: true,
  requestTimeout: 30000, // 30 seconds
  bodyLimit: 1048576, // 1MB
});

// Register CORS
fastify.register(cors, {
  origin: true,
  credentials: true,
});

// Register JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
});

// Register WebSocket for notifications
fastify.register(websocket);

// WebSocket endpoint for notifications
fastify.register(async function (fastify) {
  fastify.get('/ws/notifications', { websocket: true }, (connection, req) => {
    const notificationService = getNotificationService();

    // Extract user ID from query or JWT
    const userId = (req.query as any).userId;

    if (userId) {
      notificationService.registerConnection(userId, connection.socket);
      console.log(`WebSocket connected for user: ${userId}`);
    }

    connection.socket.on('error', (err: Error) => {
      console.error(`WebSocket error for user ${userId}:`, err);
    });

    connection.socket.on('close', () => {
      if (userId) {
        notificationService.unregisterConnection(userId);
        console.log(` WebSocket disconnected for user: ${userId}`);
      }
    });
  });
});

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  reply.status(statusCode).send({
    error: error.name || 'Error',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: request.url,
  });
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(clientRoutes, { prefix: '/api/clients' });
fastify.register(transactionRoutes, { prefix: '/api/transactions' });
fastify.register(savingsRoutes, { prefix: '/api/savings' });
fastify.register(stockRoutes, { prefix: '/api/stocks' });
fastify.register(orderRoutes, { prefix: '/api/orders' });
fastify.register(portfolioRoutes, { prefix: '/api/portfolio' });
fastify.register(directorRoutes, { prefix: '/api/director' });
fastify.register(advisorRoutes, { prefix: '/api/advisors' });
// fastify.register(systemRoutes, { prefix: '/api/system' });

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', framework: 'Fastify', timestamp: new Date().toISOString() };
});

const start = async (): Promise<void> => {
  try {
    const port = parseInt(process.env.FASTIFY_PORT || '3001');
    
    // Démarrer le scheduler automatique
    console.log('🚀 Starting Banking Scheduler...');
    startBankingScheduler();
    
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log('==============================================');
    console.log(`🚀 Fastify server running on http://localhost:${port}`);
    console.log('==============================================');
    console.log('📋 Available routes:');
    console.log('  Auth:         POST /api/auth/login');
    console.log('  Auth:         POST /api/auth/client/login');
    console.log('  Auth:         POST /api/auth/advisor/login');
    console.log('  Auth:         POST /api/auth/director/login');
    console.log('');
    console.log('  Clients:      POST /api/clients/register');
    console.log('  Clients:      GET  /api/clients/confirm-email?token=...');
    console.log('  Clients:      POST /api/clients/login');
    console.log('  Clients:      GET  /api/clients');
    console.log('  Clients:      GET  /api/clients/:id');
    console.log('  Clients:      POST /api/clients/:clientId/accounts');
    console.log('  Clients:      GET  /api/clients/:clientId/accounts');
    console.log('  Clients:      PUT  /api/clients/:clientId/accounts/:accountId');
    console.log('  Clients:      DELETE /api/clients/:clientId/accounts/:accountId');
    console.log('');
    console.log('  Transactions: POST /api/transactions/transfer');
    console.log('  Transactions: POST /api/transactions/deposit');
    console.log('  Transactions: POST /api/transactions/withdraw');
    console.log('  Transactions: GET  /api/transactions/account/:accountId');
    console.log('');
    console.log('  Stocks:       GET  /api/stocks');
    console.log('  Stocks:       GET  /api/stocks/available');
    console.log('  Stocks:       GET  /api/stocks/:id');
    console.log('');
    console.log('  Orders:       POST /api/orders');
    console.log('  Orders:       POST /api/orders/:id/execute');
    console.log('  Orders:       GET  /api/orders/stock/:stockId/price');
    console.log('');
    console.log('  Portfolio:    GET  /api/portfolio/:clientId');
    console.log('');
    console.log('  Savings:      POST /api/savings');
    console.log('  Savings:      POST /api/savings/apply-interest');
    console.log('');
    console.log('  Director:     POST /api/director/stocks');
    console.log('  Director:     PUT  /api/director/stocks/:stockId');
    console.log('  Director:     DELETE /api/director/stocks/:stockId');
    console.log('  Director:     PUT  /api/director/stocks/:stockId/availability');
    console.log('  Director:     PUT  /api/director/savings/interest-rate');
    console.log('  Director:     POST /api/director/clients');
    console.log('  Director:     PUT  /api/director/clients/:clientId');
    console.log('  Director:     DELETE /api/director/clients/:clientId');
    console.log('  Director:     POST /api/director/clients/:clientId/ban');
    console.log('');
    console.log('  Advisors:     POST /api/advisors/register');
    console.log('  Advisors:     POST /api/advisors/login');
    console.log('  Advisors:     POST /api/advisors/credits');
    console.log('  Advisors:     GET  /api/advisors/credits/:creditId/schedule');
    console.log('  Advisors:     GET  /api/advisors/clients/:clientId/credits');
    console.log('');
    console.log('  System:       GET  /api/system/database/type');
    console.log('  System:       POST /api/system/database/switch');
    console.log('  System:       POST /api/system/database/reset');
    console.log('  System:       GET  /api/system/info');
    console.log('');
    console.log('  WebSocket:    WS   /ws/notifications?userId=...');
    console.log('  Health:       GET  /health');
    console.log('==============================================');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
