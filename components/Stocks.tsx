import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, RefreshCw, TrendingUp } from 'lucide-react';
import { StockHolding } from '../types';
import { fetchStockPrice } from '../services/geminiService';

const Stocks: React.FC = () => {
  const { stocks, addStock, deleteStock, updateStockPrice } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [newStock, setNewStock] = useState<Partial<StockHolding>>({
    symbol: '',
    name: '',
    shares: 0,
    averageCost: 0,
    currentPrice: 0
  });

  const handleUpdatePrice = async (id: string, symbol: string, name: string) => {
    setUpdatingId(id);
    const price = await fetchStockPrice(symbol, name);
    if (price !== null) {
      updateStockPrice(id, price);
    } else {
      alert(`無法獲取 ${name} (${symbol}) 的最新股價。`);
    }
    setUpdatingId(null);
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStock.symbol && newStock.shares) {
      addStock({
        symbol: newStock.symbol.toUpperCase(),
        name: newStock.name || newStock.symbol,
        shares: Number(newStock.shares),
        averageCost: Number(newStock.averageCost),
        currentPrice: Number(newStock.currentPrice || newStock.averageCost) // Default to cost if no price
      });
      setIsModalOpen(false);
      setNewStock({ symbol: '', name: '', shares: 0, averageCost: 0, currentPrice: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">投資組合</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
        >
          <Plus size={18} /> 新增持股
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map(stock => {
          const totalValue = stock.shares * stock.currentPrice;
          const costBasis = stock.shares * stock.averageCost;
          const profit = totalValue - costBasis;
          const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : 0;
          const isProfitable = profit >= 0;

          return (
            <div key={stock.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isProfitable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{stock.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{stock.symbol}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteStock(stock.id)}
                  className="text-slate-300 hover:text-red-500 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                   <p className="text-slate-400 text-xs">持有股數</p>
                   <p className="font-medium text-slate-700">{stock.shares.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-slate-400 text-xs">平均成本</p>
                   <p className="font-medium text-slate-700">${stock.averageCost.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-slate-400 text-xs">目前股價</p>
                   <p className="font-medium text-slate-700">${stock.currentPrice.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-slate-400 text-xs">損益率</p>
                   <p className={`font-bold ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {profitPercent.toFixed(2)}%
                   </p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">總市值</p>
                  <p className="text-xl font-bold text-slate-800">${totalValue.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleUpdatePrice(stock.id, stock.symbol, stock.name)}
                  disabled={updatingId === stock.id}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition disabled:opacity-50"
                  title="更新即時股價"
                >
                  <RefreshCw size={18} className={updatingId === stock.id ? "animate-spin" : ""} />
                </button>
              </div>
              <p className="text-[10px] text-slate-300 mt-2 text-right">
                最後更新: {new Date(stock.lastUpdated).toLocaleDateString()} {new Date(stock.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">新增持股</h3>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">股票代號</label>
                   <input 
                    type="text" required
                    placeholder="例如 2330.TW"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    value={newStock.symbol}
                    onChange={e => setNewStock({...newStock, symbol: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">名稱</label>
                   <input 
                    type="text"
                    placeholder="例如 台積電"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newStock.name}
                    onChange={e => setNewStock({...newStock, name: e.target.value})}
                  />
                </div>
              </div>
              
               <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">股數</label>
                   <input 
                    type="number" required
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newStock.shares || ''}
                    onChange={e => setNewStock({...newStock, shares: Number(e.target.value)})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">平均成本</label>
                   <input 
                    type="number" required
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newStock.averageCost || ''}
                    onChange={e => setNewStock({...newStock, averageCost: Number(e.target.value)})}
                  />
                </div>
              </div>

               <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">現價 (選填，或稍後更新)</label>
                   <input 
                    type="number"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newStock.currentPrice || ''}
                    onChange={e => setNewStock({...newStock, currentPrice: Number(e.target.value)})}
                  />
                </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  加入投資組合
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;