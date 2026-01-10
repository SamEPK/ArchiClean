import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { MongoDBConnection } from '@infrastructure/database/MongoDBConnection';
import { TestDataSeeder } from '@infrastructure/seeders/TestDataSeeder';
import { startBankingScheduler } from '@infrastructure/scheduler/BankingScheduler';
import * as path from 'path';
import * as express from 'express';

async function bootstrap(): Promise<void> {
  // Optional Mongo connection (enabled when MONGO_URI is provided)
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await MongoDBConnection.getInstance().connect(mongoUri);
    } catch (err) {
      console.warn('[bootstrap] Mongo connection failed, continuing with in-memory');
    }
  }

  const useFastify = process.env.NEST_PLATFORM === 'fastify';
  console.log(`[bootstrap] Platform=${useFastify ? 'fastify' : 'express'}`);

  const app = useFastify
    ? await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
    : await NestFactory.create(AppModule);

  console.log('[bootstrap] App created');

  // Enable CORS
  app.enableCors();
  console.log('[bootstrap] CORS enabled');

  // Serve static assets (Express only)
  if (!useFastify) {
    const publicDir = path.join(process.cwd(), 'public');
    console.log(`[bootstrap] Serving static files from: ${publicDir}`);
    app.use('/', express.static(publicDir));
    app.use('/web', express.static(publicDir));
    app.use('/portal', express.static(publicDir, { index: 'portal.html' }));
    app.use('/dashboard-demo', express.static(path.join(publicDir, 'dashboard-demo'), { index: 'index.html' }));
    console.log('[bootstrap] Static routes configured (including /dashboard-demo)');
  }

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Banque AVENIR - API Documentation')
    .setDescription(`
      ## API Bancaire - Clean Architecture

      Cette API permet de gérer:
      - **Clients**: Inscription, authentification, gestion de comptes bancaires
      - **Épargne**: Comptes d'épargne avec intérêts quotidiens
      - **Investissement**: Ordres d'achat/vente d'actions, portfolio
      - **Crédit**: Octroi de crédits avec calcul des mensualités
      - **Messagerie**: Communication en temps réel entre clients et conseillers

      ### Architecture
      - Clean Architecture (Domain, Application, Infrastructure, Interface)
      - Repository Pattern (in-memory + MongoDB)
      - Use Cases pour chaque action métier
      - Tests unitaires (128 tests, 84% coverage)

      ### Exemples d'utilisation

      #### 1. Inscription client
      \`\`\`
      POST /api/clients/register
      {
        "email": "client@example.com",
        "password": "SecurePass123",
        "firstName": "Jean",
        "lastName": "Dupont"
      }
      \`\`\`

      #### 2. Créer un compte bancaire
      \`\`\`
      POST /api/clients/{clientId}/bank-accounts
      {
        "accountName": "Mon compte principal",
        "initialBalance": 1000
      }
      \`\`\`

      #### 3. Acheter une action
      \`\`\`
      POST /api/orders
      {
        "clientId": "client123",
        "stockId": "AAPL",
        "orderType": "buy",
        "quantity": 10,
        "price": 150.50
      }
      \`\`\`
    `)
    .setVersion('1.0.0')
    .setContact(
      'Équipe ArchiClean',
      'https://github.com/SamEPK/ArchiClean',
      'contact@archiclean.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Clients', 'Gestion des clients et authentification')
    .addTag('Bank Accounts', 'Gestion des comptes bancaires (IBAN valide)')
    .addTag('Savings', 'Comptes d\'épargne avec intérêts')
    .addTag('Stocks', 'Actions disponibles à l\'achat/vente')
    .addTag('Orders', 'Ordres d\'achat/vente d\'actions')
    .addTag('Portfolio', 'Portfolio personnel des clients')
    .addTag('Messaging', 'Messagerie temps réel (WebSocket + REST)')
    .addServer('http://localhost:3000', 'Serveur de développement')
    .addServer('https://api.archiclean.com', 'Serveur de production')
    .build();

  console.log('[bootstrap] Creating Swagger documentation...');
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  console.log('[bootstrap] Swagger configured');

  // Seed test data
  try {
    console.log('[bootstrap] Getting repositories from DI container...');
    const userRepository = app.get('IUserRepository');
    const clientRepository = app.get('IClientRepository');
    const clientRepoInstance = (clientRepository as any).instanceId;
    console.log('[bootstrap] ClientRepository from DI:', clientRepository.constructor.name, `(instance #${clientRepoInstance})`);

    const advisorRepository = app.get('IAdvisorRepository');
    const messageRepository = app.get('IMessageRepository');
    const seeder = new TestDataSeeder(userRepository, clientRepository, advisorRepository, messageRepository);
    await seeder.seedAll();
  } catch (error) {
    console.warn('[bootstrap] Seeding skipped:', error instanceof Error ? error.message : 'Unknown error');
    console.warn('[bootstrap] Error details:', error);
  }

  const port = process.env.PORT || 3000;
  const host = '0.0.0.0';

  console.log(`[bootstrap] Starting server on port ${port}...`);

  // Démarrer le scheduler automatique
  console.log('[bootstrap] Starting Banking Scheduler...');
  startBankingScheduler();
  console.log('[bootstrap] Banking Scheduler started successfully');

  if (useFastify) {
    await app.listen(port, host);
  } else {
    // Express syntax
    await app.listen(port);
  }

  console.log('[bootstrap] Server started successfully!');
  console.log('');
  console.log('==============================================');
  console.log('  Banque AVENIR - API Server');
  console.log('==============================================');
  console.log(`  Server: http://localhost:${port}`);
  console.log(`  Swagger: http://localhost:${port}/api-docs`);
  console.log(`  Login Page: http://localhost:${port}/web/index.html`);
  console.log(`  Messaging Test: http://localhost:${port}/messaging-test.html`);
  console.log('==============================================');
  console.log('  Test Accounts Created:');
  console.log('==============================================');
  console.log('  Users (for messaging):');
  console.log('    alice@test.com / password123');
  console.log('    bob@test.com / password123');
  console.log('    charlie@test.com / password123');
  console.log('    david@test.com / password123');
  console.log('    emma@test.com / password123');
  console.log('');
  console.log('  Clients (for banking):');
  console.log('    client1@test.com / password123 (Sophie Laurent)');
  console.log('    client2@test.com / password123 (Thomas Dubois)');
  console.log('    client3@test.com / password123 (Marie Rousseau)');
  console.log('    client4@test.com / password123 (Lucas Simon)');
  console.log('    client5@test.com / password123 (Julie Michel)');
  console.log('');
  console.log('  Advisors (conseillers):');
  console.log('    conseiller1@banque.com / password123 (Jean Conseiller)');
  console.log('    conseiller2@banque.com / password123 (Marie Advisor)');
  console.log('    conseiller3@banque.com / password123 (Pierre Financier)');
  console.log('');
  console.log('  Directors (directeurs):');
  console.log('    ⭐ directeur@avenir.com / DirecteurSecure123! (Jean Dupont)');
  console.log('    directeur@banque.com / password123 (Directeur Général)');
  console.log('    admin@banque.com / password123 (Admin Système)');
  console.log('==============================================');
  console.log(`  📌 Dashboard Directeur: http://localhost:${port}/director-dashboard.html`);
  console.log('==============================================');
  console.log('');
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
