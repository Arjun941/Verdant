'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionsTable from '@/components/dashboard/transactions-table';
import { getTransactions } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState, useCallback, useTransition, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileUp, Plus, Search } from 'lucide-react';
import { TransactionDialog } from '@/components/dashboard/transaction-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { handleDeleteTransaction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ImportDialog } from '@/components/dashboard/import-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export default function TransactionsPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const userTransactions = await getTransactions(user.uid);
    setTransactions(userTransactions);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      redirect('/login');
    } else {
      fetchTransactions();
    }
  }, [user, loadingAuth, fetchTransactions]);

  const handleMutationSuccess = useCallback(() => {
      fetchTransactions();
  }, [fetchTransactions]);

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
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
        handleMutationSuccess(); // Refetch data
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setIsAlertOpen(false);
      setTransactionToDelete(null);
    });
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) {
      return transactions;
    }
    return transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);


  if (loading || loadingAuth) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <>
      <div className="sm:hidden fixed bottom-20 left-4 z-50">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Add Transaction</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem onClick={handleAddTransaction}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add Manually</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsImportOpen(true)}>
                    <FileUp className="mr-2 h-4 w-4" />
                    <span>Import from CSV</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
          <TabsList className="mx-auto sm:mx-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income" disabled>Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="recurring" disabled>Recurring</TabsTrigger>
          </TabsList>
           <div className="relative w-full max-w-sm sm:w-auto sm:max-w-none flex-1 md:grow-0 sm:ml-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search by description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
            </div>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1 text-sm" onClick={() => setIsImportOpen(true)}>
              <FileUp className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Import</span>
            </Button>
            <Button size="sm" className="h-7 gap-1 text-sm" onClick={handleAddTransaction}>
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Add Transaction</span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <TransactionsTable 
            transactions={filteredTransactions} 
            onEdit={handleEditTransaction}
            onDelete={handleDeleteRequest}
          />
        </TabsContent>
        <TabsContent value="expenses">
          <TransactionsTable 
            transactions={filteredTransactions.filter(t => t.amount < 0)} 
            onEdit={handleEditTransaction}
            onDelete={handleDeleteRequest}
          />
        </TabsContent>
      </Tabs>

      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          setIsDialogOpen(false);
          handleMutationSuccess();
        }}
        transaction={selectedTransaction}
      />

       <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          setIsImportOpen(false);
          handleMutationSuccess();
        }}
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
