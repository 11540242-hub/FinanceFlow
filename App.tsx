import React, { useState } from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Stocks from './components/Stocks';

const AppContent: React.FC = () => {
  const { user } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'accounts': return <Accounts />;
      case 'transactions': return <Transactions />;
      case 'stocks': return <Stocks />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;