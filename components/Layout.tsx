import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Menu, 
  LogOut,
  User,
  Database
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout, accounts, resetData, loading } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: '總覽儀表板', icon: LayoutDashboard },
    { id: 'accounts', label: '銀行帳戶', icon: CreditCard },
    { id: 'transactions', label: '收支記錄', icon: Wallet },
    { id: 'stocks', label: '股市投資', icon: TrendingUp },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        載入資料中...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar - Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-30 w-64 h-screen bg-slate-900 text-white transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}
      >
        <div className="p-6 border-b border-slate-800">
           <h1 className="text-xl font-bold flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <span className="font-bold text-white">F</span>
             </div>
             FinanceFlow
           </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* Helper to generate demo data if empty */}
          {accounts.length === 0 && (
             <button
                onClick={() => {
                  if(confirm('確定要生成示範資料嗎？')) resetData();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 mt-4 border border-slate-700"
              >
                <Database size={20} />
                <span className="font-medium">生成示範資料</span>
              </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <User size={16} />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs truncate">{user?.email}</p>
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-white transition">
                <LogOut size={18} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
           <button 
             className="md:hidden text-slate-500"
             onClick={() => setSidebarOpen(true)}
           >
             <Menu size={24} />
           </button>
           
           <div className="ml-auto flex items-center gap-4">
              <span className="text-sm text-slate-500 hidden sm:inline">今日: {new Date().toLocaleDateString()}</span>
           </div>
        </header>

        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;