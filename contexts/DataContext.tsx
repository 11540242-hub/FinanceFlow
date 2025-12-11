import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, BankAccount, Category, StockHolding, Transaction, TransactionType, User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch, 
  orderBy 
} from 'firebase/firestore';

// Helper to generate IDs
const generateId = () => uuidv4();

interface DataContextType extends AppState {
  loading: boolean;
  logout: () => void;
  addAccount: (account: Omit<BankAccount, 'id'>) => void;
  deleteAccount: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addStock: (stock: Omit<StockHolding, 'id' | 'lastUpdated'>) => void;
  updateStockPrice: (id: string, newPrice: number) => void;
  deleteStock: (id: string) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default Categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: '薪資', type: TransactionType.INCOME, color: '#10b981' }, // Emerald
  { id: 'c2', name: '投資收益', type: TransactionType.INCOME, color: '#3b82f6' }, // Blue
  { id: 'c3', name: '飲食', type: TransactionType.EXPENSE, color: '#f59e0b' }, // Amber
  { id: 'c4', name: '交通', type: TransactionType.EXPENSE, color: '#6366f1' }, // Indigo
  { id: 'c5', name: '居住', type: TransactionType.EXPENSE, color: '#ef4444' }, // Red
  { id: 'c6', name: '娛樂', type: TransactionType.EXPENSE, color: '#ec4899' }, // Pink
  { id: 'c7', name: '其他', type: TransactionType.EXPENSE, color: '#94a3b8' }, // Slate
];

const INITIAL_STATE: AppState = {
  user: null,
  accounts: [],
  transactions: [],
  stocks: [],
  categories: DEFAULT_CATEGORIES,
};

// Demo Data Generator
export const generateDemoData = () => {
  const account1Id = generateId();
  const account2Id = generateId();
  
  return {
    accounts: [
      { id: account1Id, name: '主要薪轉戶', bankName: '中國信託', accountNumber: '822-123456789', balance: 150000, currency: 'TWD', color: '#16a34a' },
      { id: account2Id, name: '投資備用金', bankName: '國泰世華', accountNumber: '013-987654321', balance: 500000, currency: 'TWD', color: '#ea580c' },
    ],
    transactions: [
      { id: generateId(), accountId: account1Id, date: '2023-10-01', amount: 65000, type: TransactionType.INCOME, category: '薪資', note: '十月份薪資' },
      { id: generateId(), accountId: account1Id, date: '2023-10-02', amount: 12000, type: TransactionType.EXPENSE, category: '居住', note: '房租' },
      { id: generateId(), accountId: account1Id, date: '2023-10-03', amount: 350, type: TransactionType.EXPENSE, category: '飲食', note: '晚餐聚會' },
      { id: generateId(), accountId: account1Id, date: '2023-10-05', amount: 1200, type: TransactionType.EXPENSE, category: '交通', note: '加油' },
      { id: generateId(), accountId: account2Id, date: '2023-10-10', amount: 5000, type: TransactionType.INCOME, category: '投資收益', note: '股息入帳' },
    ],
    stocks: [
      { id: generateId(), symbol: '2330.TW', name: '台積電', shares: 1000, averageCost: 550, currentPrice: 1050, lastUpdated: new Date().toISOString() },
      { id: generateId(), symbol: '2317.TW', name: '鴻海', shares: 2000, averageCost: 105, currentPrice: 200, lastUpdated: new Date().toISOString() },
      { id: generateId(), symbol: 'NVDA', name: 'NVIDIA', shares: 20, averageCost: 450, currentPrice: 1200, lastUpdated: new Date().toISOString() },
    ]
  };
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (user) {
        setState(prev => ({
          ...prev,
          user: {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar: user.photoURL || undefined
          }
        }));
      } else {
        setState(INITIAL_STATE);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Listener (Firestore)
  useEffect(() => {
    if (!authUser) return;

    setLoading(true);
    const uid = authUser.uid;

    // Listen to Accounts
    const unsubAccounts = onSnapshot(collection(db, `users/${uid}/accounts`), (snapshot) => {
      const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankAccount));
      setState(prev => ({ ...prev, accounts }));
    });

    // Listen to Transactions
    const qTransactions = query(collection(db, `users/${uid}/transactions`), orderBy('date', 'desc'));
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setState(prev => ({ ...prev, transactions }));
    });

    // Listen to Stocks
    const unsubStocks = onSnapshot(collection(db, `users/${uid}/stocks`), (snapshot) => {
      const stocks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockHolding));
      setState(prev => ({ ...prev, stocks }));
      setLoading(false);
    });

    return () => {
      unsubAccounts();
      unsubTransactions();
      unsubStocks();
    };
  }, [authUser]);

  const logout = () => {
    signOut(auth);
  };

  const addAccount = async (account: Omit<BankAccount, 'id'>) => {
    if (!authUser) return;
    const newId = generateId();
    const newAccount = { ...account, id: newId };
    await setDoc(doc(db, `users/${authUser.uid}/accounts`, newId), newAccount);
  };

  const deleteAccount = async (id: string) => {
    if (!authUser) return;
    await deleteDoc(doc(db, `users/${authUser.uid}/accounts`, id));
    // Note: In a production app, you might want to delete related transactions here or use a cloud function.
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!authUser) return;
    const newId = generateId();
    const newTransaction = { ...transaction, id: newId };
    
    // Firestore transaction to update balance and add record safely
    const batch = writeBatch(db);
    
    // 1. Add Transaction
    const transRef = doc(db, `users/${authUser.uid}/transactions`, newId);
    batch.set(transRef, newTransaction);

    // 2. Update Account Balance
    const accountRef = doc(db, `users/${authUser.uid}/accounts`, transaction.accountId);
    const account = state.accounts.find(a => a.id === transaction.accountId);
    
    if (account) {
       const newBalance = transaction.type === TransactionType.INCOME 
        ? account.balance + transaction.amount 
        : account.balance - transaction.amount;
       batch.update(accountRef, { balance: newBalance });
    }

    await batch.commit();
  };

  const deleteTransaction = async (id: string) => {
    if (!authUser) return;
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) return;

    const batch = writeBatch(db);

    // 1. Delete Transaction
    const transRef = doc(db, `users/${authUser.uid}/transactions`, id);
    batch.delete(transRef);

    // 2. Revert Balance
    const accountRef = doc(db, `users/${authUser.uid}/accounts`, transaction.accountId);
    const account = state.accounts.find(a => a.id === transaction.accountId);
    
    if (account) {
      const newBalance = transaction.type === TransactionType.INCOME 
        ? account.balance - transaction.amount 
        : account.balance + transaction.amount;
      batch.update(accountRef, { balance: newBalance });
    }

    await batch.commit();
  };

  const addStock = async (stock: Omit<StockHolding, 'id' | 'lastUpdated'>) => {
    if (!authUser) return;
    const newId = generateId();
    const newStock = { ...stock, id: newId, lastUpdated: new Date().toISOString() };
    await setDoc(doc(db, `users/${authUser.uid}/stocks`, newId), newStock);
  };

  const updateStockPrice = async (id: string, newPrice: number) => {
    if (!authUser) return;
    const stockRef = doc(db, `users/${authUser.uid}/stocks`, id);
    await setDoc(stockRef, { currentPrice: newPrice, lastUpdated: new Date().toISOString() }, { merge: true });
  };

  const deleteStock = async (id: string) => {
    if (!authUser) return;
    await deleteDoc(doc(db, `users/${authUser.uid}/stocks`, id));
  };

  // Function to create demo data for new users
  const resetData = async () => {
    if (!authUser) return;
    const demo = generateDemoData();
    const batch = writeBatch(db);

    demo.accounts.forEach(acc => {
      batch.set(doc(db, `users/${authUser.uid}/accounts`, acc.id), acc);
    });
    demo.transactions.forEach(tx => {
       batch.set(doc(db, `users/${authUser.uid}/transactions`, tx.id), tx);
    });
    demo.stocks.forEach(st => {
       batch.set(doc(db, `users/${authUser.uid}/stocks`, st.id), st);
    });

    await batch.commit();
  };

  return (
    <DataContext.Provider value={{
      ...state,
      loading,
      login: () => {}, // Handled in Login component directly
      logout,
      addAccount,
      deleteAccount,
      addTransaction,
      deleteTransaction,
      addStock,
      updateStockPrice,
      deleteStock,
      resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};