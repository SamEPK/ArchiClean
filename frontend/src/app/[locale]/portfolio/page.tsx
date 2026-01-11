'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { StocksList } from '@/components/organisms/StocksList';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Briefcase, 
  BarChart2, 
  ShoppingCart, 
  Wallet 
} from 'lucide-react';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  quantity?: number;
}

interface PortfolioData {
  stocks: Stock[];
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
}

interface Account {
  id: string;
  accountName: string;
  balance: number;
}

export default function PortfolioPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'market'>('portfolio');
  
  // Modal states
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/fr/dashboard/client');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Charger le portfolio, les actions disponibles et les comptes en parallèle
        // Note: on utilise get() directement avec useCache: false pour éviter les données obsolètes
        const [portfolioData, stocksData, accountsData] = await Promise.all([
          apiClient.get(`/portfolio/${user.id}`, { useCache: false }).catch(() => null),
          apiClient.getStocks().catch(() => []),
          apiClient.getClientAccounts(user.id).catch(() => ({ accounts: [] }))
        ]);
        
        console.log('[Portfolio Page] Raw portfolio data:', portfolioData);
        
        // Traiter les comptes
        const accountsList = accountsData?.accounts || [];
        setAccounts(accountsList);
        if (accountsList.length > 0) {
          setSelectedAccountId(accountsList[0].id);
        }
        
        // Traiter les données du portfolio - L'API retourne 'items' pas 'stocks'
        if (portfolioData) {
          // L'API retourne { userId, items: [...], totalValue, totalProfit }
          const items = Array.isArray(portfolioData.items) ? portfolioData.items : 
                        Array.isArray(portfolioData.stocks) ? portfolioData.stocks : [];
          
          const processedStocks = items.map((s: any) => ({
            id: s.stockId || s.id,
            symbol: s.stockSymbol || s.symbol || s.ticker,
            name: s.stockName || s.name || s.companyName,
            price: s.currentPrice || s.averagePurchasePrice || s.price || 0,
            change: s.change || 0,
            changePercent: s.changePercent || 0,
            quantity: s.quantity || s.shares || 0,
          }));
          
          console.log('[Portfolio Page] Processed stocks:', processedStocks);
          
          setPortfolio({
            stocks: processedStocks,
            totalValue: portfolioData.totalValue || processedStocks.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0),
            totalGain: portfolioData.totalProfit || portfolioData.totalGain || 0,
            totalGainPercent: portfolioData.totalGainPercent || 0,
          });
        } else {
          // Portfolio vide par défaut
          setPortfolio({
            stocks: [],
            totalValue: 0,
            totalGain: 0,
            totalGainPercent: 0,
          });
        }
        
        // Traiter les actions disponibles sur le marché
        const processedMarketStocks = Array.isArray(stocksData) 
          ? stocksData.map((s: any) => ({
              id: s.id || s._id,
              symbol: s.symbol || s.ticker,
              name: s.name || s.companyName,
              price: s.price || s.currentPrice || 0,
              change: s.change || Math.random() * 10 - 5,
              changePercent: s.changePercent || Math.random() * 5 - 2.5,
            }))
          : getDefaultStocks();
        
        setAvailableStocks(processedMarketStocks);
      } catch (err) {
        console.error('Erreur chargement portfolio:', err);
        // Données par défaut en cas d'erreur
        setPortfolio({
          stocks: [],
          totalValue: 0,
          totalGain: 0,
          totalGainPercent: 0,
        });
        setAvailableStocks(getDefaultStocks());
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && !authLoading) {
      fetchData();
    }
  }, [user?.id, authLoading]);

  const getDefaultStocks = (): Stock[] => [
    { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.35, changePercent: 1.33 },
    { id: '2', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.92, changePercent: -0.64 },
    { id: '3', symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 5.20, changePercent: 1.39 },
    { id: '4', symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 3.15, changePercent: 1.80 },
    { id: '5', symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -4.30, changePercent: -1.70 },
    { id: '6', symbol: 'META', name: 'Meta Platforms', price: 505.75, change: 8.40, changePercent: 1.69 },
    { id: '7', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: 15.60, changePercent: 1.81 },
    { id: '8', symbol: 'BNP', name: 'BNP Paribas', price: 58.42, change: 0.85, changePercent: 1.48 },
  ];

  const handleBuy = async () => {
    if (!selectedStock || !user?.id || !selectedAccountId) {
      alert('Veuillez sélectionner un compte bancaire');
      return;
    }
    
    const buyQuantity = parseInt(quantity);
    const totalCost = buyQuantity * selectedStock.price;
    const selectedAccount = accounts.find(a => a.id === selectedAccountId);
    
    if (selectedAccount && selectedAccount.balance < totalCost) {
      alert(`Solde insuffisant. Vous avez ${selectedAccount.balance.toFixed(2)}€ mais l'achat coûte ${totalCost.toFixed(2)}€`);
      return;
    }
    
    try {
      setOperationLoading(true);
      
      // Passer un ordre d'achat
      const orderResult = await apiClient.placeOrder(
        user.id,
        selectedAccountId,
        selectedStock.id,
        'BUY',
        buyQuantity,
        selectedStock.price
      );
      
      // Exécuter l'ordre immédiatement si possible
      if (orderResult?.id || orderResult?.orderId) {
        try {
          await apiClient.executeOrder(orderResult.id || orderResult.orderId, selectedStock.price);
        } catch (execErr) {
          console.log('Ordre en attente d\'exécution');
        }
      }
      
      // Mettre à jour le portfolio localement
      const existingStock = portfolio?.stocks.find(s => s.id === selectedStock.id);
      if (existingStock) {
        setPortfolio(prev => prev ? {
          ...prev,
          stocks: prev.stocks.map(s => 
            s.id === selectedStock.id 
              ? { ...s, quantity: (s.quantity || 0) + buyQuantity }
              : s
          ),
          totalValue: prev.totalValue + totalCost,
        } : null);
      } else {
        setPortfolio(prev => prev ? {
          ...prev,
          stocks: [...prev.stocks, { ...selectedStock, quantity: buyQuantity }],
          totalValue: prev.totalValue + totalCost,
        } : null);
      }
      
      // Mettre à jour le solde du compte localement
      setAccounts(prev => prev.map(acc => 
        acc.id === selectedAccountId 
          ? { ...acc, balance: acc.balance - totalCost }
          : acc
      ));
      
      setShowBuyModal(false);
      setSelectedStock(null);
      setQuantity('1');
      alert('Achat effectué avec succès !');
    } catch (err: any) {
      console.error('Erreur achat:', err);
      alert(err.response?.data?.message || 'Erreur lors de l\'achat');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSell = async () => {
    if (!selectedStock || !user?.id || !selectedStock.quantity || !selectedAccountId) {
      alert('Veuillez sélectionner un compte bancaire');
      return;
    }
    
    const sellQuantity = parseInt(quantity);
    if (sellQuantity > selectedStock.quantity) {
      alert('Quantité insuffisante');
      return;
    }
    
    const totalValue = sellQuantity * selectedStock.price;
    
    try {
      setOperationLoading(true);
      
      // Passer un ordre de vente
      const orderResult = await apiClient.placeOrder(
        user.id,
        selectedAccountId,
        selectedStock.id,
        'SELL',
        sellQuantity,
        selectedStock.price
      );
      
      // Exécuter l'ordre immédiatement si possible
      if (orderResult?.id || orderResult?.orderId) {
        try {
          await apiClient.executeOrder(orderResult.id || orderResult.orderId, selectedStock.price);
        } catch (execErr) {
          console.log('Ordre en attente d\'exécution');
        }
      }
      
      // Mettre à jour le portfolio localement
      const newQuantity = selectedStock.quantity - sellQuantity;
      if (newQuantity === 0) {
        setPortfolio(prev => prev ? {
          ...prev,
          stocks: prev.stocks.filter(s => s.id !== selectedStock.id),
          totalValue: prev.totalValue - totalValue,
        } : null);
      } else {
        setPortfolio(prev => prev ? {
          ...prev,
          stocks: prev.stocks.map(s => 
            s.id === selectedStock.id 
              ? { ...s, quantity: newQuantity }
              : s
          ),
          totalValue: prev.totalValue - totalValue,
        } : null);
      }
      
      // Mettre à jour le solde du compte localement
      setAccounts(prev => prev.map(acc => 
        acc.id === selectedAccountId 
          ? { ...acc, balance: acc.balance + totalValue }
          : acc
      ));
      
      setShowSellModal(false);
      setSelectedStock(null);
      setQuantity('1');
      alert('Vente effectuée avec succès !');
    } catch (err: any) {
      console.error('Erreur vente:', err);
      alert(err.response?.data?.message || 'Erreur lors de la vente');
    } finally {
      setOperationLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre portfolio...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp /> Mon Portfolio</h1>
              <p className="text-purple-100 mt-1">Gérez vos investissements</p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Valeur totale</p>
              <p className="text-3xl font-bold">{formatCurrency(portfolio?.totalValue || 0)}</p>
              {portfolio && portfolio.totalGain !== 0 && (
                <div className={`flex items-center justify-end gap-1 ${portfolio.totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  <span>{portfolio.totalGain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}</span>
                  <span>{formatCurrency(Math.abs(portfolio.totalGain))}</span>
                  <span>({portfolio.totalGainPercent.toFixed(2)}%)</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'portfolio' 
                  ? 'bg-white text-purple-600' 
                  : 'bg-purple-700 text-white hover:bg-purple-600'
              }`}
            >
              <Briefcase size={18} /> Mon Portfolio
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'market' 
                  ? 'bg-white text-purple-600' 
                  : 'bg-purple-700 text-white hover:bg-purple-600'
              }`}
            >
              <BarChart2 size={18} /> Marché
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <p className="text-gray-500 text-sm">Actions détenues</p>
              <p className="text-2xl font-bold">{portfolio?.stocks.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <p className="text-gray-500 text-sm">Gain/Perte du jour</p>
              <p className={`text-2xl font-bold ${(portfolio?.totalGain || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolio?.totalGain || 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg">
            <CardContent className="p-4">
              <p className="text-gray-500 text-sm">Performance</p>
              <p className={`text-2xl font-bold ${(portfolio?.totalGainPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(portfolio?.totalGainPercent || 0) >= 0 ? '+' : ''}{(portfolio?.totalGainPercent || 0).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'portfolio' && (
          <>
            {!portfolio || portfolio.stocks.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex justify-center mb-4 text-gray-400"><BarChart2 size={64} /></div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Aucun investissement
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Commencez à investir en achetant des actions
                  </p>
                  <Button onClick={() => setActiveTab('market')} variant="primary">
                    Explorer le marché
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <StocksList 
                stocks={portfolio.stocks}
                showQuantity={true}
                onStockClick={(stock) => {
                  setSelectedStock(stock as Stock);
                }}
                onSell={(stock) => {
                  setSelectedStock(stock as Stock);
                  setShowSellModal(true);
                }}
              />
            )}
          </>
        )}

        {activeTab === 'market' && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Actions disponibles</h2>
              <p className="text-gray-600">Explorez et achetez des actions du marché</p>
            </div>
            <StocksList 
              stocks={availableStocks}
              showQuantity={false}
              onBuy={(stock) => {
                setSelectedStock(stock as Stock);
                setShowBuyModal(true);
              }}
            />
          </>
        )}
      </div>

      {/* Modal Achat */}
      <AnimatePresence>
        {showBuyModal && selectedStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBuyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <CardTitle className="mb-6 flex items-center gap-2"><ShoppingCart /> Acheter {selectedStock.symbol}</CardTitle>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-bold text-primary-600">
                      {selectedStock.symbol.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedStock.name}</p>
                    <p className="text-sm text-gray-500">{selectedStock.symbol}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-3">
                  {formatCurrency(selectedStock.price)} / action
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compte de paiement
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {accounts.length === 0 ? (
                      <option value="">Aucun compte disponible</option>
                    ) : (
                      accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountName} - {formatCurrency(acc.balance)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Montant total</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(selectedStock.price * parseInt(quantity || '0'))}
                  </p>
                  {selectedAccountId && accounts.find(a => a.id === selectedAccountId) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Solde disponible: {formatCurrency(accounts.find(a => a.id === selectedAccountId)!.balance)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowBuyModal(false);
                  setSelectedStock(null);
                  setQuantity('1');
                }}>
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  onClick={handleBuy}
                  disabled={!quantity || parseInt(quantity) <= 0 || operationLoading || !selectedAccountId}
                >
                  {operationLoading ? 'Achat...' : 'Confirmer l\'achat'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Vente */}
      <AnimatePresence>
        {showSellModal && selectedStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSellModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <CardTitle className="mb-6 flex items-center gap-2"><Wallet /> Vendre {selectedStock.symbol}</CardTitle>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-bold text-primary-600">
                      {selectedStock.symbol.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedStock.name}</p>
                    <p className="text-sm text-gray-500">{selectedStock.symbol}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-3">
                  {formatCurrency(selectedStock.price)} / action
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Vous possédez: {selectedStock.quantity} actions
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compte de réception
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {accounts.length === 0 ? (
                      <option value="">Aucun compte disponible</option>
                    ) : (
                      accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountName} - {formatCurrency(acc.balance)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité à vendre
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedStock.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {parseInt(quantity) > (selectedStock.quantity || 0) && (
                    <p className="text-red-500 text-sm mt-1">Quantité insuffisante</p>
                  )}
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Montant de la vente</p>
                  <p className="text-2xl font-bold text-red-700">
                    {formatCurrency(selectedStock.price * parseInt(quantity || '0'))}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowSellModal(false);
                  setSelectedStock(null);
                  setQuantity('1');
                }}>
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 bg-red-600 hover:bg-red-700" 
                  onClick={handleSell}
                  disabled={!quantity || parseInt(quantity) <= 0 || parseInt(quantity) > (selectedStock.quantity || 0) || operationLoading || !selectedAccountId}
                >
                  {operationLoading ? 'Vente...' : 'Confirmer la vente'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
