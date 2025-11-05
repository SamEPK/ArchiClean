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

print('MongoDB initialized successfully!');
