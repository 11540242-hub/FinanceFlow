import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { TransactionType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { generateFinancialAdvice } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { accounts, transactions, stocks, categories } = useData();
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);

  // Calculate totals
  const totalCash = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  
  // Estimate stock value (rough estimation mixing currencies for demo simplicity)
  const totalStockValue = stocks.reduce((acc, curr) => {
    // Simple heuristic: convert USD roughly to TWD for display if needed
    const multiplier = curr.symbol.includes('.TW') ? 1 : 32;
    return acc + (curr.shares * curr.currentPrice * multiplier);
  }, 0);

  const netWorth = totalCash + totalStockValue;

  // Monthly Income/Expense (Current Month)
  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0);

  // Data for Charts
  const expenseByCategory = categories
    .filter(c => c.type === TransactionType.EXPENSE)
    .map(c => {
      const value = currentMonthTransactions
        .filter(t => t.category === c.name && t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: c.name, value, color: c.color };
    })
    .filter(item => item.value > 0);

  const fetchAdvice = async () => {
    // Only attempt to fetch if we have data
    if (netWorth === 0) return;
    
    setLoadingAdvice(true);
    const topCategory = expenseByCategory.sort((a, b) => b.value - a.value)[0]?.name || '無';
    
    // Service handles missing keys gracefully now
    const advice = await generateFinancialAdvice(netWorth, monthlyIncome, monthlyExpense, topCategory);
    setAiAdvice(advice);
    setLoadingAdvice(false);
  };

  useEffect(() => {
    fetchAdvice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">總淨資產</p>
            <h3 className="text-2xl font-bold text-slate-800">${netWorth.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">本月收入</p>
            <h3 className="text-2xl font-bold text-emerald-600">+${monthlyIncome.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">本月支出</p>
            <h3 className="text-2xl font-bold text-red-600">-${monthlyExpense.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">證券現值 (估)</p>
            <h3 className="text-2xl font-bold text-purple-600">${totalStockValue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">本月支出分佈</h3>
          {expenseByCategory.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              尚無本月支出資料
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <RefreshCw size={100} />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2 flex items-center">
              Gemini 財務助理
              <button 
                onClick={fetchAdvice} 
                className="ml-auto p-1 hover:bg-white/20 rounded-full transition"
                disabled={loadingAdvice}
              >
                <RefreshCw size={16} className={loadingAdvice ? "animate-spin" : ""} />
              </button>
            </h3>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-sm leading-relaxed min-h-[160px]">
              {loadingAdvice ? (
                <div className="flex items-center justify-center h-full">正在分析您的財務狀況...</div>
              ) : (
                aiAdvice || "點擊重新整理以獲取 AI 財務建議。"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;