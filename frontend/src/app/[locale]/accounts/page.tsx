'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { AccountsGrid } from '@/components/organisms/AccountsGrid';
import { TransferZone } from '@/components/organisms/TransferZone';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'investment';
  accountNumber: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive';
  name?: string;
}

export default function AccountsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'transfer' | 'deposit'>('list');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Form states
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'checking' | 'savings' | 'investment'>('checking');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/fr/dashboard/client');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getClientAccounts(user.id);
        
        // Le backend renvoie { success, count, accounts } ou un tableau
        const accountsData = response?.accounts || (Array.isArray(response) ? response : []);
        
        // Normaliser les données des comptes
        const normalizedAccounts = accountsData.map((acc: any) => ({
          id: acc.id || acc._id,
          type: acc.type || 'checking',
          accountNumber: acc.accountNumber || acc.iban || `FR76-${acc.id?.substring(0, 8)}`,
          balance: acc.balance || 0,
          currency: acc.currency || 'EUR',
          status: acc.isActive !== false ? 'active' : 'inactive',
          name: acc.name || acc.accountName || getDefaultAccountName(acc.type),
        }));
        
        setAccounts(normalizedAccounts);
        setError(null);
      } catch (err: any) {
        console.error('Erreur chargement comptes:', err);
        setError('Impossible de charger vos comptes');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && !authLoading) {
      fetchAccounts();
    }
  }, [user?.id, authLoading]);

  const getDefaultAccountName = (type: string) => {
    switch (type) {
      case 'checking': return 'Compte Courant';
      case 'savings': return 'Compte Épargne';
      case 'investment': return 'Compte Investissement';
      default: return 'Compte';
    }
  };

  const handleCreateAccount = async () => {
    if (!user?.id || !newAccountName) return;
    
    try {
      setOperationLoading(true);
      await apiClient.createBankAccount(user.id, newAccountName, 0, 'EUR');
      
      // Recharger les comptes
      const response = await apiClient.getClientAccounts(user.id);
      const accountsData = response?.accounts || (Array.isArray(response) ? response : []);
      const normalizedAccounts = accountsData.map((acc: any) => ({
        id: acc.id || acc._id,
        type: acc.type || newAccountType,
        accountNumber: acc.accountNumber || acc.iban || `FR76-${acc.id?.substring(0, 8)}`,
        balance: acc.balance || 0,
        currency: acc.currency || 'EUR',
        status: acc.isActive !== false ? 'active' : 'inactive',
        name: acc.name || acc.accountName || getDefaultAccountName(acc.type),
      }));
      
      setAccounts(normalizedAccounts);
      setShowCreateModal(false);
      setNewAccountName('');
    } catch (err: any) {
      console.error('Erreur création compte:', err);
      alert('Erreur lors de la création du compte: ' + (err.response?.data?.message || err.message));
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedAccount || !amount) return;
    
    try {
      setOperationLoading(true);
      await apiClient.deposit(selectedAccount.id, parseFloat(amount), description);
      
      // Mettre à jour le solde localement
      setAccounts(prev => prev.map(acc => 
        acc.id === selectedAccount.id 
          ? { ...acc, balance: acc.balance + parseFloat(amount) }
          : acc
      ));
      
      setShowDepositModal(false);
      setSelectedAccount(null);
      setAmount('');
      setDescription('');
    } catch (err: any) {
      console.error('Erreur dépôt:', err);
      alert('Erreur lors du dépôt');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedAccount || !amount) return;
    
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > selectedAccount.balance) {
      alert('Solde insuffisant');
      return;
    }
    
    try {
      setOperationLoading(true);
      await apiClient.withdraw(selectedAccount.id, withdrawAmount, description);
      
      // Mettre à jour le solde localement
      setAccounts(prev => prev.map(acc => 
        acc.id === selectedAccount.id 
          ? { ...acc, balance: acc.balance - withdrawAmount }
          : acc
      ));
      
      setShowWithdrawModal(false);
      setSelectedAccount(null);
      setAmount('');
      setDescription('');
    } catch (err: any) {
      console.error('Erreur retrait:', err);
      alert('Erreur lors du retrait');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTransfer = async (fromAccountId: string, toAccountId: string, transferAmount: number) => {
    try {
      await apiClient.transfer(fromAccountId, toAccountId, transferAmount, 'Virement interne');
      
      // Mettre à jour les soldes localement
      setAccounts(prev => prev.map(acc => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: acc.balance - transferAmount };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: acc.balance + transferAmount };
        }
        return acc;
      }));
      
      alert('Virement effectué avec succès !');
    } catch (err: any) {
      console.error('Erreur virement:', err);
      alert('Erreur lors du virement');
    }
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(balance);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos comptes...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthenticatedLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mes Comptes</h1>
              <p className="text-primary-100 mt-1">Gérez vos comptes bancaires</p>
            </div>
            <div className="text-right">
              <p className="text-primary-200 text-sm">Solde total</p>
              <p className="text-3xl font-bold">{formatBalance(totalBalance)}</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'list' 
                  ? 'bg-white text-primary-600' 
                  : 'bg-primary-700 text-white hover:bg-primary-600'
              }`}
            >
              📋 Liste des comptes
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'transfer' 
                  ? 'bg-white text-primary-600' 
                  : 'bg-primary-700 text-white hover:bg-primary-600'
              }`}
            >
              💸 Virements
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Actions rapides */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            ➕ Nouveau compte
          </Button>
          <Button onClick={() => {
            if (accounts.length > 0) {
              setSelectedAccount(accounts[0]);
              setShowDepositModal(true);
            }
          }} variant="outline">
            💰 Déposer
          </Button>
          <Button onClick={() => {
            if (accounts.length > 0) {
              setSelectedAccount(accounts[0]);
              setShowWithdrawModal(true);
            }
          }} variant="outline">
            💳 Retirer
          </Button>
        </div>

        {activeTab === 'list' && (
          <>
            {accounts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🏦</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Aucun compte bancaire
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Créez votre premier compte pour commencer
                  </p>
                  <Button onClick={() => setShowCreateModal(true)} variant="primary">
                    Créer un compte
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <AccountsGrid 
                accounts={accounts.map(acc => ({
                  ...acc,
                  name: acc.name || getDefaultAccountName(acc.type)
                }))}
                onAccountClick={(account) => {
                  setSelectedAccount(account as Account);
                  setShowDepositModal(true);
                }}
                onTransfer={(account) => {
                  setSelectedAccount(account as Account);
                  setActiveTab('transfer');
                }}
                onDetails={(account) => {
                  setSelectedAccount(account as Account);
                  setShowDepositModal(true);
                }}
              />
            )}
          </>
        )}

        {activeTab === 'transfer' && (
          <TransferZone
            accounts={accounts.map(acc => ({
              id: acc.id,
              name: acc.name || getDefaultAccountName(acc.type),
              accountNumber: acc.accountNumber,
              balance: acc.balance,
              type: acc.type,
            }))}
            onTransfer={handleTransfer}
          />
        )}
      </div>

      {/* Modal création compte */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <CardTitle className="mb-6">Créer un nouveau compte</CardTitle>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du compte
                  </label>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Compte Principal"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de compte
                  </label>
                  <select
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="checking">Compte Courant</option>
                    <option value="savings">Compte Épargne</option>
                    <option value="investment">Compte Investissement</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={handleCreateAccount}
                  disabled={!newAccountName || operationLoading}
                >
                  {operationLoading ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal dépôt */}
      <AnimatePresence>
        {showDepositModal && selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowDepositModal(false);
              setSelectedAccount(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <CardTitle className="mb-6">💰 Effectuer un dépôt</CardTitle>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Compte sélectionné</p>
                <p className="font-semibold">{selectedAccount.name || getDefaultAccountName(selectedAccount.type)}</p>
                <p className="text-sm text-gray-500">{selectedAccount.accountNumber}</p>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  Solde: {formatBalance(selectedAccount.balance)}
                </p>
              </div>

              {accounts.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choisir un autre compte
                  </label>
                  <select
                    value={selectedAccount.id}
                    onChange={(e) => {
                      const acc = accounts.find(a => a.id === e.target.value);
                      if (acc) setSelectedAccount(acc);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name || getDefaultAccountName(acc.type)} - {formatBalance(acc.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant à déposer
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-2 text-gray-500">€</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Salaire, Remboursement..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowDepositModal(false);
                  setSelectedAccount(null);
                  setAmount('');
                  setDescription('');
                }}>
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={handleDeposit}
                  disabled={!amount || parseFloat(amount) <= 0 || operationLoading}
                >
                  {operationLoading ? 'Dépôt...' : 'Déposer'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal retrait */}
      <AnimatePresence>
        {showWithdrawModal && selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowWithdrawModal(false);
              setSelectedAccount(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <CardTitle className="mb-6">💳 Effectuer un retrait</CardTitle>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Compte sélectionné</p>
                <p className="font-semibold">{selectedAccount.name || getDefaultAccountName(selectedAccount.type)}</p>
                <p className="text-sm text-gray-500">{selectedAccount.accountNumber}</p>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  Solde disponible: {formatBalance(selectedAccount.balance)}
                </p>
              </div>

              {accounts.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choisir un autre compte
                  </label>
                  <select
                    value={selectedAccount.id}
                    onChange={(e) => {
                      const acc = accounts.find(a => a.id === e.target.value);
                      if (acc) setSelectedAccount(acc);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name || getDefaultAccountName(acc.type)} - {formatBalance(acc.balance)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant à retirer
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedAccount.balance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-2 text-gray-500">€</span>
                  </div>
                  {parseFloat(amount) > selectedAccount.balance && (
                    <p className="text-red-500 text-sm mt-1">Solde insuffisant</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Courses, Facture..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowWithdrawModal(false);
                  setSelectedAccount(null);
                  setAmount('');
                  setDescription('');
                }}>
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={handleWithdraw}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > selectedAccount.balance || operationLoading}
                >
                  {operationLoading ? 'Retrait...' : 'Retirer'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AuthenticatedLayout>
  );
}
