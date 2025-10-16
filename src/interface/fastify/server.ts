import Fastify from 'fastify';
import cors from '@fastify/cors';
import { savingsRoutes } from './routes/savingsRoutes';
import { stockRoutes } from './routes/stockRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { portfolioRoutes } from './routes/portfolioRoutes';

const fastify = Fastify({ logger: true });

fastify.register(cors);

fastify.register(savingsRoutes, { prefix: '/api/savings' });
fastify.register(stockRoutes, { prefix: '/api/stocks' });
fastify.register(orderRoutes, { prefix: '/api/orders' });
fastify.register(portfolioRoutes, { prefix: '/api/portfolio' });

const start = async (): Promise<void> => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Fastify server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
