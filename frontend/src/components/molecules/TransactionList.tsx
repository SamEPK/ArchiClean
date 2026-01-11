'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Card, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  recipient?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  className?: string;
  onTransactionClick?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  className,
  onTransactionClick,
}) => {
  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={20} />;
      case 'withdraw':
        return <ArrowUpRight size={20} />;
      case 'transfer':
        return <ArrowRight size={20} />;
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'Dépôt';
      case 'withdraw':
        return 'Retrait';
      case 'transfer':
        return 'Virement';
    }
  };

  const getStatusVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
    }
  };

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const sign = type === 'deposit' ? '+' : '-';
    return `${sign}${Math.abs(amount).toFixed(2)} €`;
  };

  return (
    <div className={clsx('space-y-3', className)}>
      {transactions.map((transaction) => (
        <Card
          key={transaction.id}
          className={clsx(
            'cursor-pointer hover:shadow-md transition-shadow',
            onTransactionClick && 'hover:border-primary-200'
          )}
          onClick={() => onTransactionClick?.(transaction)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Icon */}
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg',
                    transaction.type === 'deposit' && 'bg-green-500',
                    transaction.type === 'withdraw' && 'bg-red-500',
                    transaction.type === 'transfer' && 'bg-blue-500'
                  )}
                >
                  {getTypeIcon(transaction.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">
                      {getTypeLabel(transaction.type)}
                    </p>
                    <Badge
                      variant={getStatusVariant(transaction.status)}
                      size="sm"
                      dot
                    >
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {transaction.description}
                  </p>
                  {transaction.recipient && (
                    <p className="text-xs text-gray-500 mt-1">
                      À: {transaction.recipient}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(transaction.date)}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p
                    className={clsx(
                      'font-semibold text-lg',
                      transaction.type === 'deposit'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {formatAmount(transaction.amount, transaction.type)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
