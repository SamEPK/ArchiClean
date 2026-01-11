'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Loading } from '@/components/atoms/Loading';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { AccountsGrid } from '@/components/organisms/AccountsGrid';
import { TransactionList } from '@/components/molecules/TransactionList';
import { StocksList } from '@/components/organisms/StocksList';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/api-client';
import { RefreshCw, AlertCircle, ArrowRight, Plus, Send } from 'lucide-react';

interface DashboardProps {
  className?: string;
}

interface Account {
  id: string;
  iban: string;
  accountName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  description?: string;
  fromAccountId?: string;
  toAccountId?: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface PortfolioItem {
  stockId: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface DashboardData {
  accounts: Account[];
  transactions: Transaction[];
  portfolio: PortfolioItem[];
  stats: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    portfolioValue: number;
  };
}

export const ClientDashboard: React.FC<DashboardProps> = ({ className }) => {
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const fetchDashboardData = useCallback(async (showRefreshIndicator = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('[Dashboard] Fetching data for user:', user.id);

      // Fetch all data in parallel
      const [accountsRes, transactionsRes, portfolioRes] = await Promise.all([
        apiClient.getClientAccounts(user.id).catch((err) => {
          console.error('[Dashboard] Error fetching accounts:', err);
          return { success: false, accounts: [] };
        }),
        apiClient.getClientTransactions(user.id, 10).catch((err) => {
          console.error('[Dashboard] Error fetching transactions:', err);
          return { success: false, transactions: [] };
        }),
        apiClient.getClientPortfolio(user.id).catch((err) => {
          console.error('[Dashboard] Error fetching portfolio:', err);
          return { success: false, holdings: [] };
        }),
      ]);

      console.log('[Dashboard] Accounts response:', accountsRes);
      console.log('[Dashboard] Transactions response:', transactionsRes);

      // Process accounts
      const accounts = accountsRes.success !== false ? (accountsRes.accounts || []) : [];
      
      // Process transactions
      const transactions = transactionsRes.success !== false ? (transactionsRes.transactions || []) : [];

      // Process portfolio
      const portfolio = portfolioRes.holdings || [];

      // Calculate stats
      const totalBalance = accounts.reduce((sum: number, acc: Account) => sum + (acc.balance || 0), 0);
      
      // Calculate monthly income/expenses from transactions
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyTransactions = transactions.filter((t: Transaction) => 
        new Date(t.createdAt) >= startOfMonth
      );
      
      const monthlyIncome = monthlyTransactions
        .filter((t: Transaction) => t.type === 'deposit')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
      const monthlyExpenses = monthlyTransactions
        .filter((t: Transaction) => t.type === 'withdraw')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      // Calculate portfolio value
      const portfolioValue = portfolio.reduce((sum: number, item: PortfolioItem) => 
        sum + (item.totalValue || 0), 0
      );

      setDashboardData({
        accounts,
        transactions,
        portfolio,
        stats: {
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          portfolioValue,
        },
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Wait for auth to finish loading before fetching dashboard data
    if (!authLoading && user?.id) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
      // Auth finished loading but no user - stop loading spinner
      setLoading(false);
    }
  }, [fetchDashboardData, authLoading, user?.id]);

  const handleRefresh = () => {
    apiClient.clearCache();
    fetchDashboardData(true);
  };

  // Show loading while auth is loading or while we have a user and dashboard is loading
  if (authLoading || (user && loading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="xl" text="Chargement de votre tableau de bord..." />
      </div>
    );
  }

  // Show message if no user is logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <p className="text-gray-600 mb-4">Veuillez vous connecter pour accéder à votre tableau de bord</p>
        <a 
          href={`/fr/login`}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Se connecter
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchDashboardData()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome', { name: user?.firstName || 'Utilisateur' })}
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de votre situation financière
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <CardContent className="p-6">
            <p className="text-primary-100 text-sm mb-2">Solde Total</p>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(dashboardData.stats.totalBalance)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <p className="text-green-100 text-sm mb-2">Revenus du mois</p>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(dashboardData.stats.monthlyIncome)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <p className="text-red-100 text-sm mb-2">Dépenses du mois</p>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(dashboardData.stats.monthlyExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <p className="text-purple-100 text-sm mb-2">Portfolio</p>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(dashboardData.stats.portfolioValue)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Accounts */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mes Comptes</h2>
          <div className="flex items-center gap-3">
            <Badge variant="primary">{dashboardData.accounts.length} compte{dashboardData.accounts.length > 1 ? 's' : ''}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('/accounts')}
              className="flex items-center gap-2"
            >
              Gérer <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {dashboardData.accounts.length > 0 ? (
          <AccountsGrid
            accounts={dashboardData.accounts.map((acc: Account) => ({
              id: acc.id,
              type: acc.accountName.toLowerCase().includes('épargne') || acc.accountName.toLowerCase().includes('savings') ? 'savings' : 
                    acc.accountName.toLowerCase().includes('invest') ? 'investment' : 'checking',
              accountNumber: acc.iban ? `****${acc.iban.slice(-4)}` : acc.id.slice(-4),
              accountName: acc.accountName,
              balance: acc.balance,
              currency: acc.currency,
              status: acc.isActive ? 'active' : 'inactive',
            }))}
            onAccountClick={() => navigateTo('/accounts')}
          />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Aucun compte bancaire trouvé</p>
            <p className="text-sm text-gray-400 mt-2">
              Créez votre premier compte pour commencer
            </p>
          </Card>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>Transactions Récentes</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo('/accounts')}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Virement
                </Button>
              </div>
              {dashboardData.transactions.length > 0 ? (
                <TransactionList
                  transactions={dashboardData.transactions.map((t: Transaction) => ({
                    id: t.id,
                    type: t.type,
                    amount: t.amount,
                    description: t.description || getTransactionDescription(t),
                    date: t.createdAt,
                    status: (t.status === 'completed' || t.status === 'pending' || t.status === 'failed' 
                      ? t.status 
                      : 'completed') as 'pending' | 'completed' | 'failed',
                  }))}
                  onTransactionClick={() => navigateTo('/accounts')}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune transaction récente</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>Mon Portfolio</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTo('/portfolio')}
                  className="flex items-center gap-2"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              {dashboardData.portfolio.length > 0 ? (
                <StocksList
                  stocks={dashboardData.portfolio.map((item: PortfolioItem) => ({
                    id: item.stockId,
                    symbol: item.symbol,
                    name: item.name,
                    price: item.currentPrice,
                    change: item.profitLoss,
                    changePercent: item.profitLossPercent,
                    quantity: item.quantity,
                  }))}
                  showQuantity
                  onStockClick={() => navigateTo('/portfolio')}
                  onBuy={() => navigateTo('/portfolio')}
                  onSell={() => navigateTo('/portfolio')}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune action dans votre portfolio</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper function to generate transaction description
function getTransactionDescription(t: Transaction): string {
  switch (t.type) {
    case 'deposit':
      return 'Dépôt';
    case 'withdraw':
      return 'Retrait';
    case 'transfer':
      return 'Virement';
    default:
      return 'Transaction';
  }
}
