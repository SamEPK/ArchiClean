'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { motion } from 'framer-motion';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  quantity?: number;
}

interface StocksListProps {
  stocks: Stock[];
  className?: string;
  showQuantity?: boolean;
  onStockClick?: (stock: Stock) => void;
  onBuy?: (stock: Stock) => void;
  onSell?: (stock: Stock) => void;
}

export const StocksList: React.FC<StocksListProps> = ({
  stocks,
  className,
  showQuantity = false,
  onStockClick,
  onBuy,
  onSell,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className={clsx('space-y-3', className)}>
      {stocks.map((stock, index) => (
        <motion.div
          key={stock.id}
          variants={itemVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className={clsx(
              'cursor-pointer hover:shadow-lg transition-all duration-200',
              onStockClick && 'hover:border-primary-200'
            )}
            onClick={() => onStockClick?.(stock)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Stock info */}
                <div className="flex items-center space-x-4 flex-1">
                  {/* Symbol */}
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-bold text-primary-600">
                      {stock.symbol.substring(0, 2)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">
                        {stock.symbol}
                      </p>
                      <Badge
                        variant={stock.change >= 0 ? 'success' : 'danger'}
                        size="sm"
                      >
                        {formatChange(stock.change, stock.changePercent)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                    {showQuantity && stock.quantity !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Quantité: {stock.quantity}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(stock.price)}
                    </p>
                    {showQuantity && stock.quantity !== undefined && (
                      <p className="text-sm text-gray-600 mt-1">
                        Total: {formatPrice(stock.price * stock.quantity)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {(onBuy || onSell) && (
                  <div className="ml-4 flex gap-2">
                    {onBuy && (
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBuy(stock);
                        }}
                      >
                        Acheter
                      </button>
                    )}
                    {onSell && showQuantity && stock.quantity && stock.quantity > 0 && (
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSell(stock);
                        }}
                      >
                        Vendre
                      </button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
