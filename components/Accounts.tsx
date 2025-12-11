import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { BankAccount } from '../types';

const Accounts: React.FC = () => {
  const { accounts, addAccount, deleteAccount } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    name: '',
    bankName: '',
    accountNumber: '',
    balance: 0,
    currency: 'TWD',
    color: '#3b82f6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.name && newAccount.bankName) {
      addAccount({
        name: newAccount.name,
        bankName: newAccount.bankName,
        accountNumber: newAccount.accountNumber || '',
        balance: Number(newAccount.balance),
        currency: newAccount.currency || 'TWD',
        color: newAccount.color || '#3b82f6'
      });
      setIsModalOpen(false);
      setNewAccount({ name: '', bankName: '', accountNumber: '', balance: 0, currency: 'TWD', color: '#3b82f6' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">帳戶管理</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} /> 新增帳戶
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative group">
            <div className="h-2 w-full" style={{ backgroundColor: account.color }}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-full text-slate-600">
                  <CreditCard size={24} />
                </div>
                <button 
                  onClick={() => deleteAccount(account.id)}
                  className="text-slate-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-800">{account.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{account.bankName} • {account.accountNumber}</p>
              <div className="flex justify-between items-end">
                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600">{account.currency}</span>
                <span className="text-2xl font-bold text-slate-800">${account.balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">新增銀行帳戶</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">帳戶暱稱</label>
                <input 
                  type="text" required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">銀行名稱</label>
                <input 
                  type="text" required
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAccount.bankName}
                  onChange={e => setNewAccount({...newAccount, bankName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">帳號 (選填)</label>
                <input 
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAccount.accountNumber}
                  onChange={e => setNewAccount({...newAccount, accountNumber: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">初始餘額</label>
                  <input 
                    type="number" required
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAccount.balance}
                    onChange={e => setNewAccount({...newAccount, balance: Number(e.target.value)})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">幣別</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                      value={newAccount.currency}
                      onChange={e => setNewAccount({...newAccount, currency: e.target.value})}
                    >
                      <option value="TWD">TWD</option>
                      <option value="USD">USD</option>
                      <option value="JPY">JPY</option>
                    </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">代表色</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                    <button
                      type="button"
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${newAccount.color === color ? 'border-slate-800' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewAccount({...newAccount, color})}
                    />
                  ))}
                </div>
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
                  建立帳戶
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;