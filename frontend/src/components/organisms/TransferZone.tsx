'use client';

import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { clsx } from 'clsx';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Account {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  type: 'checking' | 'savings' | 'investment';
}

interface TransferZoneProps {
  accounts: Account[];
  onTransfer: (fromAccountId: string, toAccountId: string, amount: number) => void;
  className?: string;
}

const ItemTypes = {
  ACCOUNT: 'account',
};

interface DraggableAccountProps {
  account: Account;
}

const DraggableAccount: React.FC<DraggableAccountProps> = ({ account }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ACCOUNT,
    item: { account },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(balance);
  };

  return (
    <motion.div
      ref={drag}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      className={clsx(
        'p-4 bg-white border-2 border-gray-200 rounded-lg cursor-move hover:border-primary-400 transition-all',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{account.name}</p>
          <p className="text-sm text-gray-500 font-mono">{account.accountNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">{formatBalance(account.balance)}</p>
        </div>
      </div>
    </motion.div>
  );
};

interface DropZoneProps {
  account: Account;
  onDrop: (draggedAccount: Account) => void;
  isActive: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ account, onDrop, isActive }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.ACCOUNT,
    drop: (item: { account: Account }) => {
      if (item.account.id !== account.id) {
        onDrop(item.account);
      }
    },
    canDrop: (item: { account: Account }) => item.account.id !== account.id,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(balance);
  };

  return (
    <motion.div
      ref={drop}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: isOver && canDrop ? 1.05 : 1 }}
      className={clsx(
        'p-6 border-2 border-dashed rounded-lg transition-all min-h-[120px]',
        isActive && 'border-primary-500 bg-primary-50',
        !isActive && 'border-gray-300',
        isOver && canDrop && 'border-green-500 bg-green-50',
        canDrop && !isActive && 'hover:border-primary-400 hover:bg-primary-25'
      )}
    >
      <div className="flex items-center justify-between h-full">
        <div>
          <p className={clsx('font-semibold', isActive ? 'text-primary-700' : 'text-gray-900')}>
            {account.name}
          </p>
          <p className="text-sm text-gray-500 font-mono mt-1">{account.accountNumber}</p>
          <p className="text-xs text-gray-400 mt-2">
            {isActive ? 'Compte source' : 'Déposez ici pour transférer'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{formatBalance(account.balance)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const TransferZone: React.FC<TransferZoneProps> = ({
  accounts,
  onTransfer,
  className,
}) => {
  const [sourceAccount, setSourceAccount] = useState<Account | null>(null);
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const handleSourceDrop = (account: Account) => {
    setSourceAccount(account);
    setTargetAccount(null);
  };

  const handleTargetDrop = (account: Account) => {
    if (sourceAccount && account.id !== sourceAccount.id) {
      setTargetAccount(account);
      setShowModal(true);
    }
  };

  const handleConfirmTransfer = () => {
    if (sourceAccount && targetAccount && amount) {
      const transferAmount = parseFloat(amount);
      if (transferAmount > 0 && transferAmount <= sourceAccount.balance) {
        onTransfer(sourceAccount.id, targetAccount.id, transferAmount);
        resetTransfer();
      }
    }
  };

  const resetTransfer = () => {
    setSourceAccount(null);
    setTargetAccount(null);
    setAmount('');
    setShowModal(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={clsx('space-y-6', className)}>
        {/* Instructions */}
        <Card>
          <CardContent className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Comment effectuer un transfert ?
                </p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Glissez un compte depuis la liste vers la zone "Compte source"</li>
                  <li>Glissez un autre compte vers la zone "Compte destinataire"</li>
                  <li>Entrez le montant et confirmez le transfert</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drop zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              1. Compte source
            </h3>
            <DropZone
              account={
                sourceAccount || {
                  id: 'placeholder-source',
                  name: 'Glissez un compte ici',
                  accountNumber: '--- --- ---',
                  balance: 0,
                  type: 'checking',
                }
              }
              onDrop={handleSourceDrop}
              isActive={!!sourceAccount}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              2. Compte destinataire
            </h3>
            <DropZone
              account={
                targetAccount || {
                  id: 'placeholder-target',
                  name: 'Glissez un compte ici',
                  accountNumber: '--- --- ---',
                  balance: 0,
                  type: 'checking',
                }
              }
              onDrop={handleTargetDrop}
              isActive={!!targetAccount}
            />
          </div>
        </div>

        {/* Available accounts */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Vos comptes disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <DraggableAccount key={account.id} account={account} />
            ))}
          </div>
        </div>

        {/* Transfer modal */}
        <AnimatePresence>
          {showModal && sourceAccount && targetAccount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={resetTransfer}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <CardTitle className="mb-6">Confirmer le transfert</CardTitle>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">De</p>
                    <p className="font-semibold">{sourceAccount.name}</p>
                    <p className="text-sm text-gray-500">{sourceAccount.accountNumber}</p>
                  </div>

                  <div className="text-center text-2xl">↓</div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Vers</p>
                    <p className="font-semibold">{targetAccount.name}</p>
                    <p className="text-sm text-gray-500">{targetAccount.accountNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant à transférer
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={sourceAccount.balance}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0.00"
                        autoFocus
                      />
                      <span className="absolute right-4 top-2 text-gray-500">€</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Solde disponible: {sourceAccount.balance.toFixed(2)} €
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={resetTransfer}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleConfirmTransfer}
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > sourceAccount.balance}
                  >
                    Confirmer
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};
