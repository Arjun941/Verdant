'use client';

import { getTransactions, getInsights } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState, useCallback } from 'react';
import type { Insight, Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import AskVerdantChat from '@/components/dashboard/ask-verdant-chat';

export default function AskPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [userInsights, userTransactions] = await Promise.all([
        getInsights(user.uid),
        getTransactions(user.uid),
      ]);
      setInsights(userInsights);
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      redirect('/login');
    } else {
      fetchData();
    }
  }, [user, loadingAuth, fetchData]);

  if (loadingAuth || loading) {
    return (
      <div className="h-[calc(100vh-theme(spacing.36))]">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.36))]">
        <AskVerdantChat transactions={transactions} insights={insights} />
    </div>
  );
}
