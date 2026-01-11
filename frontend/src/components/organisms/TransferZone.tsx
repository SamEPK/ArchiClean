'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TransferZoneInner } from './TransferZoneInner';

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

export const TransferZone: React.FC<TransferZoneProps> = (props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <TransferZoneInner {...props} />
    </DndProvider>
  );
};
