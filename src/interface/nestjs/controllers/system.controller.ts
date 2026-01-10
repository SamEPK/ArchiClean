import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { RepositoryFactory } from '@infrastructure/repositories/RepositoryFactory';

@ApiTags('System')
@Controller('api/system')
export class SystemController {
  private startTime = Date.now();

  @Get('adapter-status')
  @ApiOperation({ summary: 'Obtenir le statut de l\'adaptateur HTTP actif' })
  @ApiResponse({ status: 200, description: 'Statut de l\'adaptateur' })
  async getAdapterStatus() {
    const adapter = process.env.NEST_PLATFORM || 'express';
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      success: true,
      adapter,
      uptime,
      uptimeFormatted: this.formatUptime(uptime),
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
    };
  }

  @Post('switch-adapter')
  @ApiOperation({ summary: 'Changer l\'adaptateur HTTP (Express ↔ Fastify)' })
  @ApiResponse({ status: 200, description: 'Adaptateur changé avec succès' })
  @ApiResponse({ status: 400, description: 'Adaptateur invalide' })
  @ApiBody({
    description: 'Adaptateur cible',
    schema: {
      type: 'object',
      required: ['adapter'],
      properties: {
        adapter: {
          type: 'string',
          enum: ['express', 'fastify'],
          example: 'fastify',
        },
      },
    },
  })
  async switchAdapter(@Body() body: { adapter: 'express' | 'fastify' }) {
    const { adapter } = body;

    if (!['express', 'fastify'].includes(adapter)) {
      return {
        success: false,
        message: 'Invalid adapter. Must be "express" or "fastify"',
      };
    }

    const currentAdapter = process.env.NEST_PLATFORM || 'express';

    if (currentAdapter === adapter) {
      return {
        success: false,
        message: `Already using ${adapter}`,
        currentAdapter,
      };
    }

    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';

      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      const lines = envContent.split('\n');
      let found = false;

      const updatedLines = lines.map((line) => {
        if (line.startsWith('NEST_PLATFORM=')) {
          found = true;
          return `NEST_PLATFORM=${adapter}`;
        }
        return line;
      });

      if (!found) {
        updatedLines.push(`NEST_PLATFORM=${adapter}`);
      }

      fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf-8');

      return {
        success: true,
        message: `Adapter switched to ${adapter}. Please restart the application for changes to take effect.`,
        previousAdapter: currentAdapter,
        newAdapter: adapter,
        restartRequired: true,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to switch adapter',
      };
    }
  }

  @Post('benchmark')
  @ApiOperation({ summary: 'Exécuter un benchmark de performance' })
  @ApiResponse({ status: 200, description: 'Résultats du benchmark' })
  async runBenchmark() {
    const iterations = 100;
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await this.simulateRequest();
      const end = Date.now();
      results.push(end - start);
    }

    const avgLatency = results.reduce((a, b) => a + b, 0) / results.length;
    const minLatency = Math.min(...results);
    const maxLatency = Math.max(...results);

    return {
      success: true,
      adapter: process.env.NEST_PLATFORM || 'express',
      iterations,
      avgLatency: Math.round(avgLatency * 100) / 100,
      minLatency,
      maxLatency,
      results: results.slice(0, 10),
    };
  }

  private async simulateRequest(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), Math.random() * 2);
    });
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else if (minutes > 0) {
      return `${minutes}min ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * GET /api/system/database-status
   * Get current database status (alias for database/type with more info)
   */
  @Get('database-status')
  @ApiOperation({ summary: 'Obtenir le statut de la base de données' })
  @ApiResponse({ status: 200, description: 'Statut de la base de données' })
  async getDatabaseStatus() {
    try {
      const factory = RepositoryFactory.getInstance();
      const currentType = factory.getDatabaseType();

      return {
        success: true,
        databaseType: currentType,
        connected: true, // Always true for in-memory, could check MongoDB connection
        message: `Currently using ${currentType.toUpperCase()} database`,
      };
    } catch (error) {
      return {
        success: false,
        databaseType: 'unknown',
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * GET /api/system/database/type
   * Get current database type
   */
  @Get('database/type')
  @ApiOperation({ summary: 'Obtenir le type de base de données actif' })
  @ApiResponse({ status: 200, description: 'Type de base de données' })
  async getDatabaseType() {
    try {
      const factory = RepositoryFactory.getInstance();
      const currentType = factory.getDatabaseType();

      return {
        success: true,
        databaseType: currentType,
        message: `Currently using ${currentType.toUpperCase()} database`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * POST /api/system/switch-database
   * Switch database type (InMemory <-> MongoDB) - Simplified API
   */
  @Post('switch-database')
  @ApiOperation({ summary: 'Changer le type de base de données (InMemory ↔ MongoDB)' })
  @ApiResponse({ status: 200, description: 'Base de données changée avec succès' })
  @ApiResponse({ status: 400, description: 'Type de base de données invalide' })
  @ApiBody({
    description: 'Type de base de données cible',
    schema: {
      type: 'object',
      required: ['databaseType'],
      properties: {
        databaseType: {
          type: 'string',
          enum: ['memory', 'mongodb'],
          example: 'mongodb',
        },
      },
    },
  })
  async switchDatabaseSimple(@Body() body: { databaseType: 'memory' | 'mongodb' }) {
    try {
      const { databaseType } = body;

      if (!databaseType || !['memory', 'mongodb'].includes(databaseType)) {
        return {
          success: false,
          message: 'Invalid database type. Must be "memory" or "mongodb"',
        };
      }

      // Normalize: 'memory' -> 'inmemory'
      const normalizedType = databaseType === 'memory' ? 'inmemory' : databaseType;

      const factory = RepositoryFactory.getInstance();
      const oldType = factory.getDatabaseType();
      const newType = factory.switchDatabase(normalizedType as 'inmemory' | 'mongodb');

      return {
        success: true,
        previousType: oldType,
        currentType: newType,
        message: `Base de données changée vers ${newType === 'inmemory' ? 'In-Memory' : 'MongoDB'}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors du changement de base de données',
      };
    }
  }

  /**
   * POST /api/system/database/switch
   * Switch database type (InMemory <-> MongoDB)
   */
  @Post('database/switch')
  @ApiOperation({ summary: 'Changer le type de base de données (InMemory ↔ MongoDB)' })
  @ApiResponse({ status: 200, description: 'Base de données changée avec succès' })
  @ApiResponse({ status: 400, description: 'Type de base de données invalide' })
  @ApiBody({
    description: 'Type de base de données cible',
    schema: {
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: ['inmemory', 'mongodb'],
          example: 'mongodb',
        },
      },
    },
  })
  async switchDatabase(@Body() body: { type: 'inmemory' | 'mongodb' }) {
    try {
      const { type } = body;

      if (!type || !['inmemory', 'mongodb'].includes(type)) {
        return {
          success: false,
          message: 'Invalid database type. Must be "inmemory" or "mongodb"',
        };
      }

      const factory = RepositoryFactory.getInstance();
      const oldType = factory.getDatabaseType();
      const newType = factory.switchDatabase(type);

      return {
        success: true,
        previousType: oldType,
        currentType: newType,
        message: `Database switched to ${newType.toUpperCase()}`,
        warning: oldType === newType ? 'Database type unchanged (may be due to context restrictions)' : null,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * POST /api/system/database/reset
   * Reset all repository instances
   * WARNING: Will lose all in-memory data
   */
  @Post('database/reset')
  @ApiOperation({ summary: 'Réinitialiser tous les repositories' })
  @ApiResponse({ status: 200, description: 'Repositories réinitialisés avec succès' })
  async resetDatabase() {
    try {
      RepositoryFactory.reset();
      
      return {
        success: true,
        message: 'All repository instances have been reset',
        warning: 'All in-memory data has been cleared',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
