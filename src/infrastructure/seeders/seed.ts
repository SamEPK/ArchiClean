import { User, UserRole } from '../../domain/entities/User';
import { Stock } from '../../domain/entities/Stock';
import { HashService } from '../services/HashService';
import { PersistentUserRepository } from '../repositories/persistent/PersistentUserRepository';
import { InMemoryStockRepository } from '../repositories/in-memory/InMemoryStockRepository';
import { uuidv4 } from '../utils/uuid-helper';

/**
 * Script de seed pour initialiser la base de données avec des données de test
 *
 * Crée:
 * - 1 Directeur (accès complet)
 * - 1 Conseiller
 * - 3 Clients
 * - 5 Actions boursières
 *
 * Usage: npm run seed
 */

const hashService = new HashService();
// Utilisation du repository persistant pour que les utilisateurs soient sauvegardés dans ./data/users.json
const userRepository = new PersistentUserRepository('./data');
const stockRepository = new InMemoryStockRepository();

async function seedUsers() {
  console.log('\n📝 Création des utilisateurs...\n');

  // 1. DIRECTEUR - Accès complet au système
  const directorEmail = 'directeur@avenir.com';
  if (await userRepository.findByEmail(directorEmail)) {
     console.log('⚠️ Le directeur existe déjà, passage...');
  } else {
    const directorPassword = await hashService.hashPassword('DirecteurSecure123!');
    const director = new User({
      id: uuidv4(),
      email: directorEmail,
      password: directorPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phoneNumber: '+33612345678',
      role: UserRole.DIRECTOR,
      isPublic: false,
      isEmailConfirmed: true, // Email déjà confirmé pour le seed
      createdAt: new Date(),
    });
    await userRepository.create(director);
    console.log('✅ Directeur créé:');
    console.log(`   Email: ${directorEmail}`);
    console.log('   Mot de passe: DirecteurSecure123!');
    console.log('   Rôle: DIRECTOR\n');
  }

  // 2. CONSEILLER
  const advisorEmail = 'conseiller@avenir.com';
  if (await userRepository.findByEmail(advisorEmail)) {
     console.log('⚠️ Le conseiller existe déjà, passage...');
  } else {
    const advisorPassword = await hashService.hashPassword('ConseillerSecure123!');
    const advisor = new User({
      id: uuidv4(),
      email: advisorEmail,
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
    console.log('✅ Conseiller créé:');
    console.log(`   Email: ${advisorEmail}`);
    console.log('   Mot de passe: ConseillerSecure123!');
    console.log('   Rôle: ADVISOR\n');
  }

  // 3. CLIENTS DE TEST
  const clients = [
    {
      email: 'client1@test.com',
      firstName: 'Pierre',
      lastName: 'Durand',
      phoneNumber: '+33634567890',
    },
    {
      email: 'client2@test.com',
      firstName: 'Sophie',
      lastName: 'Bernard',
      phoneNumber: '+33645678901',
    },
    {
      email: 'client3@test.com',
      firstName: 'Luc',
      lastName: 'Moreau',
      phoneNumber: '+33656789012',
    },
  ];

  const clientPassword = await hashService.hashPassword('ClientTest123!');

  for (const clientData of clients) {
    if (await userRepository.findByEmail(clientData.email)) {
      console.log(`⚠️ Client ${clientData.email} existe déjà, passage...`);
      continue;
    }

    const client = new User({
      id: uuidv4(),
      email: clientData.email,
      password: clientPassword,
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      phoneNumber: clientData.phoneNumber,
      role: UserRole.USER,
      isPublic: true,
      isEmailConfirmed: true,
      createdAt: new Date(),
    });
    await userRepository.create(client);
    console.log(`✅ Client créé: ${clientData.firstName} ${clientData.lastName} (${clientData.email})`);
  }

  console.log('\n   Mot de passe commun pour tous les clients: ClientTest123!\n');
}

async function seedStocks() {
  console.log('\n📈 Création des actions boursières...\n');

  const stocks = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      companyName: 'Apple Inc.',
      price: 175.50,
      isAvailable: true,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      companyName: 'Alphabet Inc. (Google)',
      price: 140.80,
      isAvailable: true,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      companyName: 'Microsoft Corporation',
      price: 380.20,
      isAvailable: true,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      companyName: 'Tesla Inc.',
      price: 245.75,
      isAvailable: true,
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      companyName: 'Amazon.com Inc.',
      price: 165.30,
      isAvailable: false, // Une action indisponible pour tester
    },
  ];

  for (const stockData of stocks) {
    const stock = new Stock(
      uuidv4(),
      stockData.symbol,
      stockData.name,
      stockData.companyName,
      stockData.isAvailable,
      stockData.price,
      new Date(),
    );
    await stockRepository.save(stock);

    const status = stockData.isAvailable ? '✅ Disponible' : '❌ Indisponible';
    console.log(`${status} - ${stockData.symbol}: ${stockData.name}`);
  }
}

async function main() {
  try {
    console.log('\n🌱 Démarrage du seeding de la base de données...\n');
    console.log('=' .repeat(60));

    await seedUsers();
    await seedStocks();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Seeding terminé avec succès!\n');
    console.log('📋 RÉCAPITULATIF DES COMPTES:\n');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ 🔐 DIRECTEUR                                            │');
    console.log('│    Email:        directeur@avenir.com                   │');
    console.log('│    Mot de passe: DirecteurSecure123!                    │');
    console.log('│    Dashboard:    /director-dashboard.html               │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ 👔 CONSEILLER                                           │');
    console.log('│    Email:        conseiller@avenir.com                  │');
    console.log('│    Mot de passe: ConseillerSecure123!                   │');
    console.log('│    Dashboard:    /advisor-complete.html                 │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ 👤 CLIENTS (3)                                          │');
    console.log('│    Emails:       client1@test.com                       │');
    console.log('│                  client2@test.com                       │');
    console.log('│                  client3@test.com                       │');
    console.log('│    Mot de passe: ClientTest123!                         │');
    console.log('│    Dashboard:    /client-complete.html                  │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n📈 5 actions boursières créées (4 disponibles + 1 indisponible)\n');
    console.log('⚠️  NOTE: Ces données sont stockées en MÉMOIRE (in-memory)');
    console.log('   Elles seront perdues au redémarrage du serveur.\n');
    console.log('🚀 Vous pouvez maintenant vous connecter avec ces comptes!\n');

    // Force save to disk before exiting
    console.log('💾 Sauvegarde sur le disque...');
    userRepository.save();
    console.log('✅ Sauvegarde terminée');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

// Exécuter le seeding
main();
