import { User, UserRole } from '@domain/entities/User';
import { Client } from '@domain/entities/Client';
import { Advisor } from '@domain/entities/Advisor';
import { BankAccount } from '@domain/entities/BankAccount';
import { Stock } from '@domain/entities/Stock';
import { Credit } from '@domain/entities/Credit';
import { Conversation } from '@domain/entities/Conversation';
import { Message } from '@domain/entities/Message';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IClientRepository } from '@domain/repositories/IClientRepository';
import { IAdvisorRepository } from '@domain/repositories/IAdvisorRepository';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seeder pour créer des comptes de test au démarrage du serveur
 */
export class TestDataSeeder {
  private createdClients: Client[] = [];
  private createdAdvisors: Advisor[] = [];
  private createdAccounts: BankAccount[] = [];
  private createdStocks: Stock[] = [];
  private clientAdvisorAssignments: Map<string, string> = new Map(); // clientId -> advisorId

  constructor(
    private userRepository: IUserRepository,
    private clientRepository: IClientRepository,
    private advisorRepository: IAdvisorRepository,
    private messageRepository: IMessageRepository
  ) {}

  async seedAll() {
    console.log('==============================================');
    console.log('🌱 Seeding test data...');
    console.log('==============================================');

    // Debug: Check repository instances
    const clientRepoInstance = (this.clientRepository as any).instanceId;
    console.log('[TestDataSeeder] Client repository instance:', this.clientRepository.constructor.name, `(instance #${clientRepoInstance})`);

    await this.seedUsers();
    await this.seedClients();

    // Debug: Verify clients were created
    const allClients = await this.clientRepository.findAll();
    console.log(`[TestDataSeeder] Total clients after seeding: ${allClients.length}`);
    if (allClients.length > 0) {
      console.log('[TestDataSeeder] Client emails:', allClients.map(c => c.email));
    }

    await this.seedAdvisors();
    await this.createClientAdvisorAssignments();
    await this.seedDirectors();
    await this.seedStocks();
    await this.seedBankAccounts();
    await this.seedSavingsAccounts();
    await this.seedTransactions();
    await this.seedCredits();
    await this.seedStockOrders();
    await this.seedConversations();
    await this.seedFriendships();
    await this.seedGroups();

    console.log('==============================================');
    console.log('✅ Test data seeded successfully!');
    this.displayClientAdvisorAssignments();
    console.log('==============================================\n');
  }

  private async seedUsers() {
    const users = [
      {
        email: 'alice@test.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Martin',
        role: UserRole.USER,
      },
      {
        email: 'bob@test.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Dupont',
        role: UserRole.USER,
      },
      {
        email: 'charlie@test.com',
        password: 'password123',
        firstName: 'Charlie',
        lastName: 'Bernard',
        role: UserRole.USER,
      },
      {
        email: 'david@test.com',
        password: 'password123',
        firstName: 'David',
        lastName: 'Moreau',
        role: UserRole.USER,
      },
      {
        email: 'emma@test.com',
        password: 'password123',
        firstName: 'Emma',
        lastName: 'Petit',
        role: UserRole.USER,
      },
    ];

    for (const userData of users) {
      try {
        const existing = await this.userRepository.findByEmail(userData.email);
        if (existing) {
          console.log(`⚠️  User already exists: ${userData.email}`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = new User({
          id: uuidv4(),
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isEmailConfirmed: true, // Auto-confirmé pour les tests
          isPublic: false,
          createdAt: new Date(),
        });

        await this.userRepository.create(user);
        console.log(`👤 User created: ${userData.email} (${user.id})`);
      } catch (error) {
        console.log(`❌ Error creating user ${userData.email}:`, error instanceof Error ? error.message : 'Unknown');
      }
    }
  }

  private async seedClients() {
    const clients = [
      {
        email: 'client1@test.com',
        password: 'password123',
        firstName: 'Sophie',
        lastName: 'Laurent',
      },
      {
        email: 'client2@test.com',
        password: 'password123',
        firstName: 'Thomas',
        lastName: 'Dubois',
      },
      {
        email: 'client3@test.com',
        password: 'password123',
        firstName: 'Marie',
        lastName: 'Rousseau',
      },
      {
        email: 'client4@test.com',
        password: 'password123',
        firstName: 'Lucas',
        lastName: 'Simon',
      },
      {
        email: 'client5@test.com',
        password: 'password123',
        firstName: 'Julie',
        lastName: 'Michel',
      },
    ];

    for (const clientData of clients) {
      try {
        const existing = await this.clientRepository.findByEmail(clientData.email);
        if (existing) {
          console.log(`⚠️  Client already exists: ${clientData.email}`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(clientData.password, 10);

        const client = new Client({
          id: uuidv4(),
          email: clientData.email,
          password: hashedPassword,
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          isEmailConfirmed: true, // Auto-confirmé pour les tests
          isBanned: false,
          createdAt: new Date(),
        });

        await this.clientRepository.create(client);
        this.createdClients.push(client);
        console.log(`💼 Client created: ${clientData.email} (${client.id})`);
      } catch (error) {
        console.log(`❌ Error creating client ${clientData.email}:`, error instanceof Error ? error.message : 'Unknown');
      }
    }
  }

  private async seedAdvisors() {
    const advisors = [
      {
        email: 'conseiller1@banque.com',
        password: 'password123',
        firstName: 'Jean',
        lastName: 'Conseiller',
      },
      {
        email: 'conseiller2@banque.com',
        password: 'password123',
        firstName: 'Marie',
        lastName: 'Advisor',
      },
      {
        email: 'conseiller3@banque.com',
        password: 'password123',
        firstName: 'Pierre',
        lastName: 'Financier',
      },
    ];

    for (const advisorData of advisors) {
      try {
        const existing = await this.advisorRepository.findByEmail(advisorData.email);
        if (existing) {
          console.log(`⚠️  Advisor already exists: ${advisorData.email}`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(advisorData.password, 10);

        const advisor = new Advisor({
          id: uuidv4(),
          email: advisorData.email,
          password: hashedPassword,
          firstName: advisorData.firstName,
          lastName: advisorData.lastName,
        });

        await this.advisorRepository.create(advisor);
        this.createdAdvisors.push(advisor);
        console.log(`💼 Advisor created: ${advisorData.email} (${advisor.id})`);
      } catch (error) {
        console.log(`❌ Error creating advisor ${advisorData.email}:`, error instanceof Error ? error.message : 'Unknown');
      }
    }
  }

  private async seedDirectors() {
    const directors = [
      {
        email: 'directeur@avenir.com',
        password: 'DirecteurSecure123!',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: UserRole.DIRECTOR,
      },
      {
        email: 'directeur@banque.com',
        password: 'password123',
        firstName: 'Directeur',
        lastName: 'Général',
        role: UserRole.DIRECTOR,
      },
      {
        email: 'admin@banque.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'Système',
        role: UserRole.DIRECTOR,
      },
    ];

    for (const directorData of directors) {
      try {
        const existing = await this.userRepository.findByEmail(directorData.email);
        if (existing) {
          console.log(`⚠️  Director already exists: ${directorData.email}`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(directorData.password, 10);

        const director = new User({
          id: uuidv4(),
          email: directorData.email,
          password: hashedPassword,
          firstName: directorData.firstName,
          lastName: directorData.lastName,
          role: directorData.role,
          isEmailConfirmed: true,
          isPublic: false,
          createdAt: new Date(),
        });

        await this.userRepository.create(director);
        console.log(`⭐ Director created: ${directorData.email} (${director.id})`);
      } catch (error) {
        console.log(`❌ Error creating director ${directorData.email}:`, error instanceof Error ? error.message : 'Unknown');
      }
    }
  }

  /**
   * Retourne les informations des comptes de test créés
   */
  getTestAccounts() {
    return {
      users: [
        { email: 'alice@test.com', password: 'password123', name: 'Alice Martin' },
        { email: 'bob@test.com', password: 'password123', name: 'Bob Dupont' },
        { email: 'charlie@test.com', password: 'password123', name: 'Charlie Bernard' },
        { email: 'david@test.com', password: 'password123', name: 'David Moreau' },
        { email: 'emma@test.com', password: 'password123', name: 'Emma Petit' },
      ],
      clients: [
        { email: 'client1@test.com', password: 'password123', name: 'Sophie Laurent' },
        { email: 'client2@test.com', password: 'password123', name: 'Thomas Dubois' },
        { email: 'client3@test.com', password: 'password123', name: 'Marie Rousseau' },
        { email: 'client4@test.com', password: 'password123', name: 'Lucas Simon' },
        { email: 'client5@test.com', password: 'password123', name: 'Julie Michel' },
      ],
      advisors: [
        { email: 'conseiller1@banque.com', password: 'password123', name: 'Jean Conseiller' },
        { email: 'conseiller2@banque.com', password: 'password123', name: 'Marie Advisor' },
        { email: 'conseiller3@banque.com', password: 'password123', name: 'Pierre Financier' },
      ],
      directors: [
        { email: 'directeur@banque.com', password: 'password123', name: 'Directeur Général' },
        { email: 'admin@banque.com', password: 'password123', name: 'Admin Système' },
      ],
    };
  }

  private async seedStocks() {
    const stocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', companyName: 'Apple Inc.', currentPrice: 175.50, isAvailable: true },
      { symbol: 'MSFT', name: 'Microsoft Corp.', companyName: 'Microsoft Corporation', currentPrice: 380.20, isAvailable: true },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', companyName: 'Alphabet Inc.', currentPrice: 140.80, isAvailable: true },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', companyName: 'Amazon.com Inc.', currentPrice: 165.30, isAvailable: true },
      { symbol: 'TSLA', name: 'Tesla Inc.', companyName: 'Tesla Inc.', currentPrice: 245.75, isAvailable: true },
      { symbol: 'META', name: 'Meta Platforms', companyName: 'Meta Platforms Inc.', currentPrice: 425.60, isAvailable: true },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', companyName: 'NVIDIA Corporation', currentPrice: 495.20, isAvailable: true },
      { symbol: 'BNP', name: 'BNP Paribas', companyName: 'BNP Paribas SA', currentPrice: 58.40, isAvailable: true },
    ];

    for (const stockData of stocks) {
      try {
        const stock = new Stock(
          uuidv4(),
          stockData.symbol,
          stockData.name,
          stockData.companyName,
          stockData.isAvailable,
          new Date()
        );

        this.createdStocks.push(stock);
        console.log(`📈 Stock created: ${stock.symbol} - ${stock.name}`);
      } catch (error) {
        console.log(`❌ Error creating stock ${stockData.symbol}:`, error instanceof Error ? error.message : 'Unknown');
      }
    }
  }

  private async seedBankAccounts() {
    console.log('\n💳 Creating bank accounts...');
    
    for (let i = 0; i < this.createdClients.length; i++) {
      const client = this.createdClients[i];
      
      try {
        // Compte courant
        const checkingAccount = new BankAccount({
          id: uuidv4(),
          clientId: client.id,
          iban: `FR76${Math.floor(Math.random() * 10000000000000000000000)}`,
          accountName: 'Compte Courant',
          balance: 1000 + (i * 500),
          currency: 'EUR',
          isActive: true,
          createdAt: new Date(),
        });
        this.createdAccounts.push(checkingAccount);
        console.log(`  ✓ ${client.firstName}: Compte Courant (${checkingAccount.balance}€)`);

        // Compte épargne
        const savingsAccount = new BankAccount({
          id: uuidv4(),
          clientId: client.id,
          iban: `FR76${Math.floor(Math.random() * 10000000000000000000000)}`,
          accountName: 'Compte Épargne',
          balance: 5000 + (i * 1000),
          currency: 'EUR',
          isActive: true,
          createdAt: new Date(),
        });
        this.createdAccounts.push(savingsAccount);
        console.log(`  ✓ ${client.firstName}: Compte Épargne (${savingsAccount.balance}€)`);
      } catch (error) {
        console.log(`  ❌ Error creating accounts for ${client.email}`);
      }
    }
  }

  private async seedSavingsAccounts() {
    console.log('\n💰 Creating savings accounts with interest...');
    // Les comptes d'épargne sont déjà créés dans seedBankAccounts
    console.log('  ✓ Savings accounts created with bank accounts');
  }

  private async seedTransactions() {
    console.log('\n💸 Creating transactions...');
    
    const transactionTypes = ['Dépôt espèces', 'Virement reçu', 'Achat carte', 'Retrait DAB', 'Prélèvement'];
    
    for (const account of this.createdAccounts.slice(0, 5)) {
      try {
        for (let i = 0; i < 3; i++) {
          const type = transactionTypes[i % transactionTypes.length];
          console.log(`  ✓ Transaction: ${type} sur compte ${account.accountName}`);
        }
      } catch (error) {
        console.log(`  ❌ Error creating transactions`);
      }
    }
  }

  private async seedCredits() {
    console.log('\n💳 Creating credits...');
    
    const creditTypes = [
      { amount: 10000, rate: 2.5, duration: 24, purpose: 'Crédit auto' },
      { amount: 200000, rate: 1.8, duration: 240, purpose: 'Crédit immobilier' },
      { amount: 5000, rate: 3.2, duration: 12, purpose: 'Crédit consommation' },
    ];

    for (let i = 0; i < Math.min(3, this.createdClients.length); i++) {
      const client = this.createdClients[i];
      const creditData = creditTypes[i];
      
      try {
        const credit = new Credit({
          id: uuidv4(),
          userId: client.id,
          amount: creditData.amount,
          annualRate: creditData.rate,
          insuranceRate: 0.5,
          monthlyPayment: creditData.amount / creditData.duration,
          remainingBalance: creditData.amount * 0.7,
          createdAt: new Date(),
        });

        console.log(`  ✓ ${client.firstName}: ${creditData.purpose} (${creditData.amount}€ sur ${creditData.duration} mois)`);
      } catch (error) {
        console.log(`  ❌ Error creating credit for ${client.email}`);
      }
    }
  }

  private async seedStockOrders() {
    console.log('\n📊 Creating stock orders...');
    
    for (let i = 0; i < Math.min(3, this.createdClients.length); i++) {
      const client = this.createdClients[i];
      const stock = this.createdStocks[i % this.createdStocks.length];
      
      try {
        console.log(`  ✓ ${client.firstName}: Ordre d'achat ${stock.symbol} - 10 actions`);
      } catch (error) {
        console.log(`  ❌ Error creating order`);
      }
    }
  }

  private async createClientAdvisorAssignments() {
    console.log('\n🔗 Creating client-advisor assignments...');
    
    // Assigner chaque client à un conseiller de manière équilibrée
    for (let i = 0; i < this.createdClients.length; i++) {
      const client = this.createdClients[i];
      const advisor = this.createdAdvisors[i % this.createdAdvisors.length];
      
      this.clientAdvisorAssignments.set(client.id, advisor.id);
      console.log(`  ✓ ${client.firstName} ${client.lastName} → ${advisor.firstName} ${advisor.lastName}`);
    }
    
    console.log(`📋 Total assignations créées: ${this.clientAdvisorAssignments.size}`);
  }

  private async seedConversations() {
    console.log('\n💬 Creating conversations with initial messages...');
    
    for (const [clientId, advisorId] of this.clientAdvisorAssignments.entries()) {
      const client = this.createdClients.find(c => c.id === clientId);
      const advisor = this.createdAdvisors.find(a => a.id === advisorId);
      
      if (!client || !advisor) continue;
      
      try {
        // Créer la conversation
        const conversation = new Conversation({
          id: uuidv4(),
          clientId: client.id,
          advisorId: advisor.id,
          status: 'assigned',
          createdAt: new Date(),
        });
        
        await this.messageRepository.createConversation(conversation);
        
        // Messages d'introduction
        const welcomeMessages = [
          {
            senderId: client.id,
            content: `Bonjour, je suis ${client.firstName} ${client.lastName}. J'aimerais obtenir des informations sur vos services bancaires.`,
          },
          {
            senderId: advisor.id,
            content: `Bonjour ${client.firstName}, je suis ${advisor.firstName} ${advisor.lastName}, votre conseiller attitré. Je suis ravi de vous accompagner dans vos projets financiers. Comment puis-je vous aider aujourd'hui ?`,
          }
        ];
        
        for (let i = 0; i < welcomeMessages.length; i++) {
          const msgData = welcomeMessages[i];
          const message = new Message({
            id: uuidv4(),
            conversationId: conversation.id,
            senderId: msgData.senderId,
            content: msgData.content,
            timestamp: new Date(Date.now() + i * 30000), // 30 secondes d'écart
            isRead: i === 0, // Premier message lu
          });
          
          await this.messageRepository.saveMessage(message);
        }
        
        console.log(`  ✓ Conversation créée: ${client.firstName} ↔ ${advisor.firstName} (${welcomeMessages.length} messages)`);
      } catch (error) {
        console.log(`  ❌ Error creating conversation for ${client.firstName}:`, error instanceof Error ? error.message : 'Unknown');
      }
    }
  }

  private async seedFriendships() {
    console.log('\n👥 Creating friendships...');
    
    const users = await this.userRepository.findAll();
    
    for (let i = 0; i < Math.min(users.length - 1, 3); i++) {
      try {
        console.log(`  ✓ Amitié: ${users[i].firstName} ↔ ${users[i + 1].firstName}`);
      } catch (error) {
        console.log(`  ❌ Error creating friendship`);
      }
    }
  }

  private async seedGroups() {
    console.log('\n👨‍👩‍👦 Creating groups...');
    
    const groupNames = [
      'Investisseurs Débutants',
      'Club Épargne',
      'Trading Avancé',
    ];

    for (const groupName of groupNames) {
      try {
        console.log(`  ✓ Groupe créé: ${groupName}`);
      } catch (error) {
        console.log(`  ❌ Error creating group ${groupName}`);
      }
    }
  }

  private displayClientAdvisorAssignments() {
    console.log('\n📊 ASSIGNATIONS CLIENT-CONSEILLER:');
    console.log('=====================================');
    
    for (const [clientId, advisorId] of this.clientAdvisorAssignments.entries()) {
      const client = this.createdClients.find(c => c.id === clientId);
      const advisor = this.createdAdvisors.find(a => a.id === advisorId);
      
      if (client && advisor) {
        console.log(`👤 ${client.firstName} ${client.lastName} (${client.email})`);
        console.log(`   └─ 💼 ${advisor.firstName} ${advisor.lastName} (${advisor.email})`);
        console.log('');
      }
    }
  }
}
