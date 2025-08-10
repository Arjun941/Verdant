'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { getTransactions, getInsights, addInsight, deleteInsight } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState, useCallback } from 'react';
import type { Insight, Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { generateSpendingInsights } from '@/ai/flows/generate-insights';
import ReactMarkdown from 'react-markdown';

export default function InsightsPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndGenerateInsights = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [existingInsights, userTransactions] = await Promise.all([
        getInsights(user.uid),
        getTransactions(user.uid),
      ]);
      setTransactions(userTransactions);

      if (userTransactions.length < 5) {
        setInsights([{
          id: '1',
          summary: "Not enough data to generate insights.",
          detailedAnalysis: "You need at least 5 transactions to get your first personalized insight. Keep adding your expenses!",
          createdAt: new Date().toISOString(),
        }]);
        setLoading(false);
        return;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const lastInsight = existingInsights.length > 0 ? existingInsights[0] : null;
      const lastInsightDate = lastInsight ? new Date(lastInsight.createdAt) : null;
      if (lastInsightDate) {
        lastInsightDate.setHours(0, 0, 0, 0);
      }
      
      const shouldGenerateNewInsight = !lastInsight || (lastInsightDate && lastInsightDate.getTime() < today.getTime());

      if (shouldGenerateNewInsight) {
        const result = await generateSpendingInsights({ 
            transactions: userTransactions,
            previousInsights: existingInsights,
        });

        const newInsight: Omit<Insight, 'id'> = { ...result, createdAt: new Date().toISOString() };
        await addInsight(user.uid, newInsight);

        // Keep the latest 7 insights for better performance
        if (existingInsights.length >= 7) {
            const oldestInsight = existingInsights[existingInsights.length - 1];
            await deleteInsight(user.uid, oldestInsight.id);
        }
        
        // Show the latest insights on screen
        const updatedInsights = await getInsights(user.uid);
        setInsights(updatedInsights);

      } else {
        setInsights(existingInsights);
      }

    } catch (error) {
      console.error("Error fetching or generating insights:", error);
      setInsights([{
        id: 'error',
        summary: "Error generating insights.",
        detailedAnalysis: "We couldn't generate your insights at this time. Please try again later.",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      redirect('/login');
    } else {
      fetchAndGenerateInsights();
    }
  }, [user, loadingAuth, fetchAndGenerateInsights]);

  if (loadingAuth || loading) {
    return (
      <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <Lightbulb className="h-8 w-8 text-yellow-400" />
                <div className='flex-1'>
                     <Skeleton className="h-8 w-1/4 mb-2" />
                     <Skeleton className="h-5 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="grid auto-rows-max gap-6">
        {insights.length > 0 ? (
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Lightbulb className="h-8 w-8 flex-shrink-0 text-yellow-400" />
                    <div>
                        <CardTitle>Your Financial Insights</CardTitle>
                        <CardDescription>
                            {`Here's your latest analysis from ${new Date(insights[0].createdAt).toLocaleDateString()}`}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-4">{insights[0].summary}</h3>
                    <div className="prose-insights">
                        <ReactMarkdown>{insights[0].detailedAnalysis}</ReactMarkdown>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle>No Insights Yet</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Start adding transactions to see your AI-powered insights.</p>
                </CardContent>
            </Card>
        )}
      </div>
  );
}
