import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../src/domain/entities/User';
import { UserModel } from '../src/infrastructure/repositories/mongodb/UserModel';
import { HashService } from '../src/infrastructure/services/HashService';

// Charger les variables d'environnement
dotenv.config();

const hashService = new HashService();

// Données de test
const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'admin@archiclean.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
  firstName: process.env.ADMIN_FIRSTNAME || 'Admin',
  lastName: process.env.ADMIN_LASTNAME || 'ArchiClean',
  role: UserRole.ADMIN,
};

const TEST_USERS = [
  {
    email: 'quentin.dev@archiclean.com',
    password: 'Quentin123!',
    firstName: 'Quentin',
    lastName: 'Développeur',
    role: UserRole.USER,
    bio: 'Développeur passionné par l\'architecture logicielle',
    isPublic: true,
  },
  {
    email: 'marie.dupont@archiclean.com',
    password: 'Marie123!',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: UserRole.USER,
    bio: 'Gestionnaire de compte bancaire',
    isPublic: true,
  },
  {
    email: 'jean.martin@archiclean.com',
    password: 'Jean123!',
    firstName: 'Jean',
    lastName: 'Martin',
    role: UserRole.ADVISOR,
    bio: 'Conseiller financier avec 10 ans d\'expérience',
    isPublic: true,
  },
  {
    email: 'sophie.bernard@archiclean.com',
    password: 'Sophie123!',
    firstName: 'Sophie',
    lastName: 'Bernard',
    role: UserRole.DIRECTOR,
    bio: 'Directrice de banque',
    isPublic: false,
  },
  {
    email: 'pierre.dubois@archiclean.com',
    password: 'Pierre123!',
    firstName: 'Pierre',
    lastName: 'Dubois',
    role: UserRole.USER,
    bio: 'Investisseur débutant',
    isPublic: true,
  },
  {
    email: 'julie.leroy@archiclean.com',
    password: 'Julie123!',
    firstName: 'Julie',
    lastName: 'Leroy',
    role: UserRole.USER,
    phoneNumber: '+33 6 12 34 56 78',
    bio: 'Amatrice d\'épargne et d\'investissement',
    isPublic: true,
  },
];

async function createUser(userData: any) {
  const hashedPassword = await hashService.hashPassword(userData.password);
  
  const user = new User({
    id: uuidv4(),
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phoneNumber: userData.phoneNumber,
    role: userData.role,
    bio: userData.bio,
    isPublic: userData.isPublic !== undefined ? userData.isPublic : false,
    isEmailConfirmed: true, // Auto-confirmé pour les fixtures
    createdAt: new Date(),
  });

  const userDoc = {
    _id: user.id,
    email: user.email,
    password: user.password,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    bio: user.bio,
    isPublic: user.isPublic,
    isEmailConfirmed: user.isEmailConfirmed,
    createdAt: user.createdAt,
  };

  await UserModel.create(userDoc);
  console.log(`✓ Utilisateur créé: ${user.email} (${user.role})`);
  
  return user;
}

async function seedDatabase() {
  try {
    console.log('🌱 Démarrage du seed de la base de données...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/archiclean?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✓ Connecté à MongoDB\n');

    // Supprimer les utilisateurs existants
    console.log('🗑️  Suppression des utilisateurs existants...');
    await UserModel.deleteMany({});
    console.log('✓ Utilisateurs supprimés\n');

    // Créer l'administrateur
    console.log('👤 Création de l\'administrateur...');
    await createUser(ADMIN_USER);
    console.log('');

    // Créer les utilisateurs de test
    console.log('👥 Création des utilisateurs de test...');
    for (const userData of TEST_USERS) {
      await createUser(userData);
    }
    console.log('');

    // Afficher un résumé
    const userCount = await UserModel.countDocuments();
    console.log('📊 Résumé:');
    console.log(`   Total utilisateurs: ${userCount}`);
    console.log(`   - Admins: ${await UserModel.countDocuments({ role: UserRole.ADMIN })}`);
    console.log(`   - Directors: ${await UserModel.countDocuments({ role: UserRole.DIRECTOR })}`);
    console.log(`   - Advisors: ${await UserModel.countDocuments({ role: UserRole.ADVISOR })}`);
    console.log(`   - Users: ${await UserModel.countDocuments({ role: UserRole.USER })}`);
    console.log('');

    // Afficher les identifiants de test
    console.log('🔑 IDENTIFIANTS DE TEST:');
    console.log('════════════════════════════════════════');
    console.log('\n👨‍💼 ADMIN:');
    console.log(`   Email:    ${ADMIN_USER.email}`);
    console.log(`   Password: ${ADMIN_USER.password}`);
    console.log('\n👤 UTILISATEURS DE TEST:');
    TEST_USERS.forEach((user, index) => {
      if (index === 0 || user.role !== TEST_USERS[index - 1].role) {
        console.log(`\n   ${user.role}:`);
      }
      console.log(`   Email:    ${user.email}`);
      console.log(`   Password: ${user.password}`);
    });
    console.log('\n════════════════════════════════════════');
    console.log('\n✅ Seed terminé avec succès!\n');

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Déconnecté de MongoDB');
  }
}

// Exécuter le seed
seedDatabase();
