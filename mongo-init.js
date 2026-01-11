// Script d'initialisation MongoDB
db = db.getSiblingDB('archiclean');

// Créer les collections
db.createCollection('users');
db.createCollection('clients');
db.createCollection('bankaccounts');
db.createCollection('savingsaccounts');
db.createCollection('stocks');
db.createCollection('orders');
db.createCollection('portfolios');
db.createCollection('messages');
db.createCollection('conversations');
db.createCollection('groups');
db.createCollection('friendships');

// Créer les index
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ emailConfirmationToken: 1 });
db.clients.createIndex({ email: 1 }, { unique: true });
db.stocks.createIndex({ symbol: 1 }, { unique: true });
db.portfolios.createIndex({ clientId: 1 });
db.friendships.createIndex({ requesterId: 1, addresseeId: 1 }, { unique: true });

// Insérer les stocks par défaut
db.stocks.insertMany([
  {
    _id: 'stock-aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    companyName: 'Apple Inc.',
    price: 178.50,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-googl',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    companyName: 'Alphabet Inc.',
    price: 141.80,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-msft',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    companyName: 'Microsoft Corporation',
    price: 378.90,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-amzn',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    companyName: 'Amazon.com Inc.',
    price: 178.25,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-tsla',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    companyName: 'Tesla Inc.',
    price: 248.50,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-meta',
    symbol: 'META',
    name: 'Meta Platforms',
    companyName: 'Meta Platforms Inc.',
    price: 505.75,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-nvda',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    companyName: 'NVIDIA Corporation',
    price: 875.30,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-bnp',
    symbol: 'BNP',
    name: 'BNP Paribas',
    companyName: 'BNP Paribas SA',
    price: 58.42,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-total',
    symbol: 'TTE',
    name: 'TotalEnergies',
    companyName: 'TotalEnergies SE',
    price: 62.15,
    isAvailable: true,
    createdAt: new Date()
  },
  {
    _id: 'stock-lvmh',
    symbol: 'MC',
    name: 'LVMH',
    companyName: 'LVMH Moët Hennessy Louis Vuitton',
    price: 715.80,
    isAvailable: true,
    createdAt: new Date()
  }
]);

print('MongoDB initialized successfully with stocks data!');
