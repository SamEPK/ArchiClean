'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { motion } from 'framer-motion';

interface Account {
  id: string;
  type: 'checking' | 'savings' | 'investment';
  accountNumber: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive';
}

interface AccountsGridProps {
  accounts: Account[];
  className?: string;
  onAccountClick?: (account: Account) => void;
  onTransfer?: (account: Account) => void;
  onDetails?: (account: Account) => void;
}

export const AccountsGrid: React.FC<AccountsGridProps> = ({
  accounts,
  className,
  onAccountClick,
  onTransfer,
  onDetails,
}) => {
  const getTypeLabel = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return 'Compte Courant';
      case 'savings':
        return 'Compte Épargne';
      case 'investment':
        return 'Compte Investissement';
    }
  };

  const getTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return '💳';
      case 'savings':
        return '🏦';
      case 'investment':
        return '📈';
    }
  };

  const getTypeColor = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return 'from-blue-500 to-blue-600';
      case 'savings':
        return 'from-green-500 to-green-600';
      case 'investment':
        return 'from-purple-500 to-purple-600';
    }
  };

  const formatBalance = (balance: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(balance);
  };

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
      className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}
    >
      {accounts.map((account) => (
        <motion.div 
          key={account.id} 
          variants={itemVariants}
          onClick={() => onAccountClick?.(account)}
          className={clsx(
            onAccountClick && 'cursor-pointer'
          )}
        >
          <Card
            className={clsx(
              'hover:shadow-xl transition-all duration-300 overflow-hidden',
              onAccountClick && 'hover:scale-105'
            )}
          >
            {/* Gradient header */}
            <div
              className={clsx(
                'bg-gradient-to-br p-6 text-white',
                getTypeColor(account.type)
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{getTypeIcon(account.type)}</span>
                <Badge
                  variant={account.status === 'active' ? 'success' : 'default'}
                  className="bg-white/20 text-white"
                  dot
                >
                  {account.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <CardTitle className="text-white mb-2">
                {getTypeLabel(account.type)}
              </CardTitle>
              <p className="text-sm text-white/80 font-mono">
                {account.accountNumber}
              </p>
            </div>

            {/* Balance section */}
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Solde disponible</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatBalance(account.balance, account.currency)}
              </p>

              {/* Action buttons */}
              <div className="mt-6 flex gap-2">
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransfer?.(account);
                  }}
                >
                  Virement
                </button>
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetails?.(account);
                  }}
                >
                  Détails
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
