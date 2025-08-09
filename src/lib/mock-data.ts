import type { Transaction } from './types';

export const mockTransactions: Transaction[] = [];

export const spendingByCategory = mockTransactions.reduce((acc, transaction) => {
  if (!acc[transaction.category]) {
    acc[transaction.category] = 0;
  }
  acc[transaction.category] += transaction.amount;
  return acc;
}, {} as Record<Transaction['category'], number>);

export const chartData = Object.entries(spendingByCategory).map(([name, value]) => ({
  name,
  value,
}));
