import { FastifyInstance } from 'fastify';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';

/**
 * System routes for administrative operations
 * - Database type switching (InMemory <-> MongoDB)
 * - Health checks
 * - System information
 */
export async function systemRoutes(fastify: FastifyInstance) {
  
  /**
   * GET /system/database/type
   * Get current database type
   */
  fastify.get('/system/database/type', async (request, reply) => {
    try {
      const factory = RepositoryFactory.getInstance();
      const currentType = factory.getDatabaseType();
      
      return reply.send({
        success: true,
        databaseType: currentType,
        message: `Currently using ${currentType.toUpperCase()} database`,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /system/database/switch
   * Switch database type (InMemory <-> MongoDB)
   * Body: { type: 'inmemory' | 'mongodb' }
   */
  fastify.post<{
    Body: { type: 'inmemory' | 'mongodb' }
  }>('/system/database/switch', async (request, reply) => {
    try {
      const { type } = request.body;
      
      if (!type || !['inmemory', 'mongodb'].includes(type)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid database type. Must be "inmemory" or "mongodb"',
        });
      }

      const factory = RepositoryFactory.getInstance();
      const oldType = factory.getDatabaseType();
      const newType = factory.switchDatabase(type);
      
      return reply.send({
        success: true,
        previousType: oldType,
        currentType: newType,
        message: `Database switched to ${newType.toUpperCase()}`,
        warning: oldType === newType ? 'Database type unchanged (may be due to context restrictions)' : null,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /system/database/reset
   * Reset all repository instances
   * WARNING: Will lose all in-memory data
   */
  fastify.post('/system/database/reset', async (request, reply) => {
    try {
      RepositoryFactory.reset();
      
      return reply.send({
        success: true,
        message: 'All repository instances have been reset',
        warning: 'All in-memory data has been cleared',
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /system/info
   * Get system information
   */
  fastify.get('/system/info', async (request, reply) => {
    try {
      const factory = RepositoryFactory.getInstance();
      
      return reply.send({
        success: true,
        system: {
          databaseType: factory.getDatabaseType(),
          nodeVersion: process.version,
          platform: process.platform,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          environment: process.env.NODE_ENV || 'development',
        },
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
