'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Loading } from '@/components/atoms/Loading';
import { Badge } from '@/components/atoms/Badge';
import { AccountsGrid } from '@/components/organisms/AccountsGrid';
import { TransactionList } from '@/components/molecules/TransactionList';
import { StocksList } from '@/components/organisms/StocksList';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

interface DashboardProps {
  className?: string;
}

export const ClientDashboard: React.FC<DashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const t = useTranslations('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // Simulate data fetching with cache
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from API with cache
        // const data = await cachedApiFetch('/api/dashboard', {}, { ttl: 300 });
        
        // Mock data for demonstration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDashboardData({
          accounts: [
            {
              id: '1',
              type: 'checking',
              accountNumber: '****1234',
              balance: 5420.50,
              currency: 'EUR',
              status: 'active',
            },
            {
              id: '2',
              type: 'savings',
              accountNumber: '****5678',
              balance: 12300.00,
              currency: 'EUR',
              status: 'active',
            },
            {
              id: '3',
              type: 'investment',
              accountNumber: '****9012',
              balance: 8750.25,
              currency: 'EUR',
              status: 'active',
            },
          ],
          recentTransactions: [
            {
              id: 't1',
              type: 'deposit',
              amount: 1500.00,
              description: 'Salaire',
              date: new Date().toISOString(),
              status: 'completed',
            },
            {
              id: 't2',
              type: 'withdraw',
              amount: 250.00,
              description: 'Retrait ATM',
              date: new Date(Date.now() - 86400000).toISOString(),
              status: 'completed',
            },
            {
              id: 't3',
              type: 'transfer',
              amount: 500.00,
              description: 'Virement interne',
              date: new Date(Date.now() - 172800000).toISOString(),
              status: 'completed',
              recipient: 'Compte Épargne',
            },
          ],
          portfolio: [
            {
              id: 's1',
              symbol: 'AAPL',
              name: 'Apple Inc.',
              price: 182.50,
              change: 2.30,
              changePercent: 1.28,
              quantity: 10,
            },
            {
              id: 's2',
              symbol: 'GOOGL',
              name: 'Alphabet Inc.',
              price: 142.80,
              change: -1.20,
              changePercent: -0.83,
              quantity: 5,
            },
          ],
          stats: {
            totalBalance: 26470.75,
            monthlyIncome: 4200.00,
            monthlyExpenses: 2850.00,
            portfolioValue: 1539.00,
          },
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="xl" text="Chargement de votre tableau de bord..." />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Impossible de charger les données</p>
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
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('welcome', { name: user?.firstName || 'Utilisateur' })}
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre situation financière
        </p>
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
          <Badge variant="primary">{dashboardData.accounts.length} comptes</Badge>
        </div>
        <AccountsGrid
          accounts={dashboardData.accounts}
          onAccountClick={(account) => console.log('Account clicked:', account)}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-6">Transactions Récentes</CardTitle>
              <TransactionList
                transactions={dashboardData.recentTransactions}
                onTransactionClick={(transaction) =>
                  console.log('Transaction clicked:', transaction)
                }
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <CardTitle className="mb-6">Mon Portfolio</CardTitle>
              <StocksList
                stocks={dashboardData.portfolio}
                showQuantity
                onStockClick={(stock) => console.log('Stock clicked:', stock)}
                onBuy={(stock) => console.log('Buy stock:', stock)}
                onSell={(stock) => console.log('Sell stock:', stock)}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
