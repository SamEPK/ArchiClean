'use client';

import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { clsx } from 'clsx';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Lightbulb, 
  Check, 
  Download, 
  ArrowDown, 
  ArrowRight,
  Wallet,
  Landmark
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  type: 'checking' | 'savings' | 'investment';
}

interface TransferZoneInnerProps {
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
  }), [account]); 

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
  account: Account | null; // null si placeholder
  onDrop: (draggedAccount: Account) => void;
  onRemove?: () => void; // Fonction pour retirer le compte
  excludeAccountId?: string; // ID du compte à exclure
  label: string; // Label de la zone
}

const DropZone: React.FC<DropZoneProps> = ({ account, onDrop, onRemove, excludeAccountId, label }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.ACCOUNT,
    drop: (item: { account: Account }) => {
      // Ne pas permettre de déposer le compte exclu (l'autre zone)
      if (!excludeAccountId || item.account.id !== excludeAccountId) {
        onDrop(item.account);
      }
    },
    canDrop: (item: { account: Account }) => {
      // Autoriser le drop si ce n'est pas le compte exclu
      return !excludeAccountId || item.account.id !== excludeAccountId;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [onDrop, excludeAccountId]);

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
        'p-6 border-2 border-dashed rounded-lg transition-all min-h-[120px] relative',
        account && 'border-primary-500 bg-primary-50',
        !account && 'border-gray-300',
        isOver && canDrop && 'border-green-500 bg-green-50 scale-105',
        canDrop && !account && 'hover:border-primary-400 hover:bg-primary-25'
      )}
    >
      {account && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10"
          title="Retirer ce compte"
        >
          <X size={16} />
        </button>
      )}
      <div className="flex items-center justify-between h-full">
        <div>
          <p className={clsx('font-semibold', account ? 'text-primary-700' : 'text-gray-400')}>
            {account ? account.name : `Glissez un compte ici`}
          </p>
          {account ? (
            <>
              <p className="text-sm text-gray-500 font-mono mt-1">{account.accountNumber}</p>
              <p className="text-xs text-primary-600 mt-2 font-medium flex items-center gap-1">
                <Check size={12} /> {label}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-400 mt-2">
              {label}
            </p>
          )}
        </div>
        <div className="text-right">
          {account ? (
            <p className="text-xl font-bold text-gray-900">{formatBalance(account.balance)}</p>
          ) : (
            <div className="text-4xl text-gray-300">
              <Download size={40} strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const TransferZoneInner: React.FC<TransferZoneInnerProps> = ({
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
    if (targetAccount?.id === account.id) {
      setTargetAccount(null);
    }
  };

  const handleTargetDrop = (account: Account) => {
    setTargetAccount(account);
    if (sourceAccount?.id === account.id) {
      setSourceAccount(null);
    }
  };

  React.useEffect(() => {
    if (sourceAccount && targetAccount) {
      setShowModal(true);
    }
  }, [sourceAccount, targetAccount]);

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
    <div className={clsx('space-y-6', className)}>
      {/* Instructions */}
      <Card>
        <CardContent className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/50 rounded-lg">
              <Lightbulb size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Comment effectuer un transfert ?
              </p>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Glissez un compte depuis la liste vers la zone "Compte source"</li>
                <li>Glissez un autre compte vers la zone "Compte destinataire"</li>
                <li>Entrez le montant et confirmez le transfert</li>
              </ol>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1 italic">
                <Lightbulb size={12} /> Astuce : Cliquez sur le <X size={10} className="inline mx-0.5 bg-red-500 text-white rounded-full p-0.5" /> pour retirer un compte
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drop zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Wallet size={16} className="text-primary-600" />
            1. Compte source
          </h3>
          <DropZone
            account={sourceAccount}
            onDrop={handleSourceDrop}
            onRemove={() => setSourceAccount(null)}
            excludeAccountId={targetAccount?.id}
            label="Compte à débiter"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Landmark size={16} className="text-primary-600" />
            2. Compte destinataire
          </h3>
          <DropZone
            account={targetAccount}
            onDrop={handleTargetDrop}
            onRemove={() => setTargetAccount(null)}
            excludeAccountId={sourceAccount?.id}
            label="Compte à créditer"
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

                  <div className="text-center flex justify-center py-2">
                    <ArrowDown className="text-gray-400" size={24} />
                  </div>

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
  );
};
