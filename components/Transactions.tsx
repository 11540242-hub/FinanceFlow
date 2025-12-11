import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

const Transactions: React.FC = () => {
  const { transactions, accounts, categories, addTransaction, deleteTransaction } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  
  const [newTrans, setNewTrans] = useState<Partial<Transaction>>({
    amount: 0,
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    category: '',
    accountId: '',
    note: ''
  });

  const filteredTransactions = transactions
    .filter(t => filterType === 'ALL' || t.type === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown Account';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrans.amount && newTrans.category && newTrans.accountId) {
      addTransaction({
        amount: Number(newTrans.amount),
        type: newTrans.type as TransactionType,
        date: newTrans.date!,
        category: newTrans.category!,
        accountId: newTrans.accountId!,
        note: newTrans.note || ''
      });
      setIsModalOpen(false);
      setNewTrans({
        amount: 0,
        type: TransactionType.EXPENSE,
        date: new Date().toISOString().split('T')[0],
        category: '',
        accountId: '',
        note: ''
      });
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800">收支記錄</h2>
        <div className="flex gap-2">
           <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2">
            <Filter size={16} className="text-slate-400 mr-2" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="py-2 outline-none text-slate-600 bg-transparent"
            >
              <option value="ALL">全部記錄</option>
              <option value={TransactionType.INCOME}>只看收入</option>
              <option value={TransactionType.EXPENSE}>只看支出</option>
            </select>
           </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
          >
            <Plus size={18} /> 記一筆
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">日期</th>
                <th className="p-4 font-medium">分類</th>
                <th className="p-4 font-medium">帳戶</th>
                <th className="p-4 font-medium">備註</th>
                <th className="p-4 font-medium text-right">金額</th>
                <th className="p-4 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 text-slate-600">{t.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{getAccountName(t.accountId)}</td>
                  <td className="p-4 text-slate-500 text-sm">{t.note}</td>
                  <td className={`p-4 text-right font-bold ${
                    t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'
                  }`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                     <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    尚無相關記錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">新增收支記錄</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setNewTrans({...newTrans, type: TransactionType.EXPENSE, category: ''})}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${newTrans.type === TransactionType.EXPENSE ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <ArrowDownLeft size={16}/> 支出
                </button>
                <button
                  type="button"
                   onClick={() => setNewTrans({...newTrans, type: TransactionType.INCOME, category: ''})}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${newTrans.type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <ArrowUpRight size={16}/> 收入
                </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
                   <input 
                    type="date" required
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTrans.date}
                    onChange={e => setNewTrans({...newTrans, date: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">金額</label>
                   <input 
                    type="number" required min="1"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newTrans.amount || ''}
                    onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})}
                  />
                </div>
               </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">帳戶</label>
                <select 
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none bg-white"
                  value={newTrans.accountId}
                  onChange={e => setNewTrans({...newTrans, accountId: e.target.value})}
                >
                  <option value="" disabled>選擇帳戶</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (${a.balance})</option>
                  ))}
                </select>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">分類</label>
                 <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.type === newTrans.type).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewTrans({...newTrans, category: c.name})}
                        className={`px-3 py-1 text-sm rounded-full border transition ${newTrans.category === c.name ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">備註</label>
                <input 
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTrans.note}
                  onChange={e => setNewTrans({...newTrans, note: e.target.value})}
                  placeholder="輸入備註..."
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
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;