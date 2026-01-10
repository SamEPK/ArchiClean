import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

class PostgresConnection {
  private static instance: PostgresConnection | null = null;
  private dataSource: DataSource | null = null;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): PostgresConnection {
    if (!PostgresConnection.instance) {
      PostgresConnection.instance = new PostgresConnection();
    }
    return PostgresConnection.instance;
  }

  async connect(): Promise<DataSource> {
    if (this.dataSource?.isInitialized) {
      return this.dataSource;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.dataSource?.isInitialized) {
        return this.dataSource;
      }
    }

    this.isConnecting = true;

    try {
      const options: DataSourceOptions = {
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'archiclean',
        synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in dev
        logging: process.env.POSTGRES_LOGGING === 'true',
        entities: [__dirname + '/entities/**/*.{js,ts}'],
        migrations: [__dirname + '/migrations/**/*.{js,ts}'],
        subscribers: [__dirname + '/subscribers/**/*.{js,ts}'],
      };

      this.dataSource = new DataSource(options);
      await this.dataSource.initialize();

      console.log('✅ PostgreSQL connection established successfully');
      return this.dataSource;
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error instanceof Error ? error.message : 'Unknown error');
      console.warn('⚠️  Continuing without PostgreSQL - using InMemory/MongoDB repositories instead');
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  getDataSource(): DataSource | null {
    return this.dataSource;
  }

  async disconnect(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      console.log('PostgreSQL connection closed');
    }
  }

  isConnected(): boolean {
    return this.dataSource?.isInitialized ?? false;
  }
}

export const postgresConnection = PostgresConnection.getInstance();
