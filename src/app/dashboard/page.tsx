'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import KpiCard from '@/components/dashboard/kpi-card';
import { IndianRupee, CreditCard, Activity, Pencil, Lightbulb } from 'lucide-react';
import SpendingChart from '@/components/dashboard/spending-chart';
import AiTransactionForm from '@/components/dashboard/ai-transaction-form';
import TransactionsTable from '@/components/dashboard/transactions-table';
import { getTransactions, getUserProfile, getInsights } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState, useCallback, useTransition } from 'react';
import type { Transaction, UserProfile, Insight } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionDialog } from '@/components/dashboard/transaction-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { handleDeleteTransaction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { BalanceDialog } from '@/components/dashboard/balance-dialog';
import { TimezoneNotification } from '@/components/dashboard/timezone-notification';
import { getCurrentHourInTimezone } from '@/lib/timezone';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const { toast } = useToast();

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  
  const [greeting, setGreeting] = useState('');

  // Show the right greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      if (profile?.timezone) {
        // What time is it where the user lives?
        const hour = getCurrentHourInTimezone(profile.timezone);
        
        if (hour < 12) {
          setGreeting('Good morning');
        } else if (hour < 18) {
          setGreeting('Good afternoon');
        } else {
          setGreeting('Good evening');
        }
      } else {
        // Use device time if timezone isn't set yet
        const hour = new Date().getHours();
        if (hour < 12) {
          setGreeting('Good morning');
        } else if (hour < 18) {
          setGreeting('Good afternoon');
        } else {
          setGreeting('Good evening');
        }
      }
    };
    
    updateGreeting();
  }, [profile?.timezone]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    setLoadingInsights(true);
    try {
      const [userTransactions, userProfile, userInsights] = await Promise.all([
        getTransactions(user.uid),
        getUserProfile(user.uid),
        getInsights(user.uid),
      ]);
      setTransactions(userTransactions);
      setProfile(userProfile);
      setInsights(userInsights);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: 'Error',
        description: 'Could not fetch dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
      setLoadingInsights(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      redirect('/login');
    } else {
      fetchData();
    }
  }, [user, loadingAuth, fetchData]);

  const handleTransactionAdded = (newTransaction: Omit<Transaction, 'id'>) => {
    const optimisticTransaction: Transaction = {
      id: `temp-${Date.now()}`,
      ...newTransaction,
      date: newTransaction.date,
    };
    setTransactions(prev => [optimisticTransaction, ...prev]);
  };

  const handleMutationComplete = useCallback(() => {
    startTransition(() => {
      fetchData();
    });
  }, [fetchData]);
  
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };
  
  const handleDeleteRequest = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !transactionToDelete) return;
    
    startTransition(async () => {
      const result = await handleDeleteTransaction(user.uid, transactionToDelete);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        handleMutationComplete();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setIsAlertOpen(false);
      setTransactionToDelete(null);
    });
  };

  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = transactions.length > 0 ? totalSpending / transactions.length : 0;
  const balance = profile?.balance || 0;
  
  const displayName = profile?.displayName?.split(' ')[0] || 'User';

  const latestInsightSummary = insights.length > 0 ? insights[0].summary : "Start adding transactions to get your first insight.";

  if (loadingAuth || loadingData) {
    return (
       <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Skeleton className="h-8 w-1/4 mb-4" />
        </motion.div>
        <motion.div 
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[1, 2, 3, 4].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3 + (index * 0.1),
                type: "spring",
                stiffness: 300 
              }}
            >
              <Skeleton className="h-28" />
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Skeleton className="xl:col-span-2 h-[400px]" />
          <Skeleton className="h-[400px]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Skeleton className="h-[300px]" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
            <h1 className="text-2xl font-semibold tracking-tight">{greeting}, {displayName}!</h1>
        </motion.div>

        {/* Timezone notification */}
        <TimezoneNotification />
        
        <motion.div 
          className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { title: "Total Spending", value: `₹${totalSpending.toFixed(2)}`, icon: IndianRupee, description: "Total amount spent this month" },
            { title: "Transactions", value: transactions.length.toString(), icon: CreditCard, description: "Total transactions this month" },
            { title: "Average Transaction", value: `₹${averageTransaction.toFixed(2)}`, icon: Activity, description: "Average transaction value" },
            { title: "Current Balance", value: `₹${balance.toFixed(2)}`, icon: Pencil, description: "Click to edit your balance", onClick: () => setIsBalanceDialogOpen(true), isInteractive: true }
          ].map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3 + (index * 0.1),
                type: "spring",
                stiffness: 300 
              }}
            >
              <KpiCard {...kpi} />
            </motion.div>
          ))}
        </motion.div>
        
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2 grid gap-4 auto-rows-max">
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 0.7 }}
             >
               <Card className="transition-all duration-300 hover:shadow-lg border-border/50 hover:border-border">
                  <CardHeader>
                    <CardTitle>Spending Overview</CardTitle>
                    <CardDescription>A chart showing your spending by category.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <SpendingChart transactions={transactions} />
                  </CardContent>
                </Card>
             </motion.div>
             
             <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.6, delay: 0.9 }}
             >
               <Card className="transition-all duration-300 hover:shadow-lg border-border/50 hover:border-border">
                  <CardHeader className="flex flex-row items-center gap-2">
                     <motion.div
                       animate={{ rotate: [0, 10, -10, 0] }}
                       transition={{ 
                         duration: 2,
                         repeat: Infinity,
                         repeatDelay: 5,
                         ease: "easeInOut"
                       }}
                     >
                       <Lightbulb className="h-6 w-6 text-yellow-400" />
                     </motion.div>
                     <div className="flex-1">
                      <CardTitle>AI Insights</CardTitle>
                      <CardDescription>A quick summary of your spending habits.</CardDescription>
                     </div>
                  </CardHeader>
                  <CardContent>
                    {loadingInsights ? (
                      <Skeleton className="h-12 w-full" />
                    ) : (
                      <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                      >
                        {latestInsightSummary}
                      </motion.p>
                    )}
                  </CardContent>
                  <CardFooter>
                     <Link href="/dashboard/insights" className="text-sm text-primary hover:underline transition-all duration-200 hover:scale-105">
                        View Detailed Analysis
                      </Link>
                  </CardFooter>
                </Card>
             </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="transition-all duration-300 hover:shadow-lg border-border/50 hover:border-border">
              <CardHeader>
                <CardTitle>AI Transaction Entry</CardTitle>
                <CardDescription>Use natural language to add a transaction.</CardDescription>
              </CardHeader>
              <CardContent>
                <AiTransactionForm onTransactionAdded={handleTransactionAdded} onTransactionSaved={handleMutationComplete} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="transition-all duration-300 hover:shadow-lg border-border/50 hover:border-border">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your 5 most recent transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable 
                transactions={transactions.slice(0, 5)} 
                showPagination={false} 
                onEdit={handleEditTransaction}
                onDelete={handleDeleteRequest}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <TransactionDialog
        isOpen={isTransactionDialogOpen}
        onClose={() => setIsTransactionDialogOpen(false)}
        onSuccess={() => {
          setIsTransactionDialogOpen(false);
          handleMutationComplete();
        }}
        transaction={selectedTransaction}
      />
      
      <BalanceDialog
        isOpen={isBalanceDialogOpen}
        onClose={() => setIsBalanceDialogOpen(false)}
        onSuccess={() => {
            setIsBalanceDialogOpen(false);
            handleMutationComplete();
        }}
        currentBalance={profile?.balance}
        currentDisplayName={profile?.displayName}
       />

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
