export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  currency: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
}

export interface StockHolding {
  id: string;
  symbol: string; // e.g., '2330.TW', 'AAPL'
  name: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  lastUpdated: string; // ISO String
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface AppState {
  user: User | null;
  accounts: BankAccount[];
  transactions: Transaction[];
  stocks: StockHolding[];
  categories: Category[];
}