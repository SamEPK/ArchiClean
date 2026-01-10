import { User, UserRole } from '@domain/entities/User';
import { Stock } from '@domain/entities/Stock';
import { HashService } from '../services/HashService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IStockRepository } from '@domain/repositories/IStockRepository';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initialise les données de démarrage dans les repositories fournis
 *
 * Fonction utilisée au démarrage de l'application pour créer:
 * - Utilisateurs par défaut (directeur, conseiller, clients)
 * - Actions boursières de démonstration
 *
 * @param userRepository - Repository utilisateur à peupler
 * @param stockRepository - Repository stocks à peupler
 */
export async function initializeData(
  userRepository: IUserRepository,
  stockRepository: IStockRepository,
): Promise<void> {
  console.log('\n🌱 Initialisation des données de démarrage...\n');

  const hashService = new HashService();

  // Vérifier si des données existent déjà
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('ℹ️  Données déjà présentes, initialisation ignorée.\n');
    return;
  }

  // === UTILISATEURS ===

  // 1. DIRECTEUR
  const directorPassword = await hashService.hashPassword('DirecteurSecure123!');
  const director = new User({
    id: uuidv4(),
    email: 'directeur@avenir.com',
    password: directorPassword,
    firstName: 'Jean',
    lastName: 'Dupont',
    phoneNumber: '+33612345678',
    role: UserRole.DIRECTOR,
    isPublic: false,
    isEmailConfirmed: true,
    createdAt: new Date(),
  });
  await userRepository.create(director);
  console.log('✅ Directeur créé: directeur@avenir.com / DirecteurSecure123!');

  // 2. CONSEILLER
  const advisorPassword = await hashService.hashPassword('ConseillerSecure123!');
  const advisor = new User({
    id: uuidv4(),
    email: 'conseiller@avenir.com',
    password: advisorPassword,
    firstName: 'Marie',
    lastName: 'Martin',
    phoneNumber: '+33623456789',
    role: UserRole.ADVISOR,
    isPublic: false,
    isEmailConfirmed: true,
    createdAt: new Date(),
  });
  await userRepository.create(advisor);
  console.log('✅ Conseiller créé: conseiller@avenir.com / ConseillerSecure123!');

  // 3. CLIENTS
  const clientPassword = await hashService.hashPassword('ClientTest123!');
  const clients = [
    { email: 'client1@test.com', firstName: 'Pierre', lastName: 'Durand', phone: '+33634567890' },
    { email: 'client2@test.com', firstName: 'Sophie', lastName: 'Bernard', phone: '+33645678901' },
    { email: 'client3@test.com', firstName: 'Luc', lastName: 'Moreau', phone: '+33656789012' },
  ];

  for (const clientData of clients) {
    const client = new User({
      id: uuidv4(),
      email: clientData.email,
      password: clientPassword,
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      phoneNumber: clientData.phone,
      role: UserRole.USER,
      isPublic: true,
      isEmailConfirmed: true,
      createdAt: new Date(),
    });
    await userRepository.create(client);
    console.log(`✅ Client créé: ${clientData.email} / ClientTest123!`);
  }

  // === ACTIONS BOURSIÈRES ===

  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', companyName: 'Apple Inc.', isAvailable: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', companyName: 'Alphabet Inc. (Google)', isAvailable: true },
    { symbol: 'MSFT', name: 'Microsoft Corporation', companyName: 'Microsoft Corporation', isAvailable: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', companyName: 'Tesla Inc.', isAvailable: true },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', companyName: 'Amazon.com Inc.', isAvailable: false },
  ];

  for (const stockData of stocks) {
    const stock = new Stock(
      uuidv4(),
      stockData.symbol,
      stockData.name,
      stockData.companyName,
      stockData.isAvailable,
      new Date(),
    );
    await stockRepository.save(stock);
    const status = stockData.isAvailable ? '✅' : '❌';
    console.log(`${status} Action créée: ${stockData.symbol} - ${stockData.name}`);
  }

  console.log('\n✅ Initialisation terminée!\n');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ 🔐 COMPTES DE TEST CRÉÉS:                               │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Directeur:  directeur@avenir.com / DirecteurSecure123! │');
  console.log('│ Conseiller: conseiller@avenir.com / ConseillerSecure123│');
  console.log('│ Clients:    client1@test.com / ClientTest123!          │');
  console.log('│             client2@test.com / ClientTest123!          │');
  console.log('│             client3@test.com / ClientTest123!          │');
  console.log('└─────────────────────────────────────────────────────────┘\n');
}
