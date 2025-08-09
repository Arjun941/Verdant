
'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { handleCategorizeTransaction, handleAddTransaction, CategorizeFormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, CheckCircle } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';


function AnalyzeButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Analyzing...' : 'Analyze Transaction'}
    </Button>
  );
}

type AiTransactionFormProps = {
  onTransactionAdded: (transaction: Omit<Transaction, 'id'>) => void;
  onTransactionSaved: () => void;
};


export default function AiTransactionForm({ onTransactionAdded, onTransactionSaved }: AiTransactionFormProps) {
  const [user] = useAuthState(auth);
  const [isSaving, startSaveTransition] = useTransition();

  const initialCategorizeState: CategorizeFormState = { message: '' };
  const [categorizeState, categorizeFormAction, isCategorizePending] = useActionState(handleCategorizeTransaction, initialCategorizeState);
  
  const [addState, setAddState] = useState<{success: boolean, message: string}>({success: false, message: ''});
  
  const categorizeFormRef = useRef<HTMLFormElement>(null);
  const addFormRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (categorizeState.message && !categorizeState.data) {
        toast({
            title: 'Update',
            description: categorizeState.message,
        });
        onTransactionSaved();
        resetAll();
    } else if (categorizeState.data) {
        setShowConfirmation(true);
    }
  }, [categorizeState, onTransactionSaved, toast]);


  const handleConfirm = async () => {
    if (categorizeState.data) {
        onTransactionAdded({
            ...categorizeState.data,
            date: new Date(categorizeState.data.date).toISOString(),
        });
    }
    toast({
        title: 'Success',
        description: "Transaction saved.",
    });
    onTransactionSaved();
    resetAll();
  };

  const resetAll = () => {
    setShowConfirmation(false);
    if (textAreaRef.current) {
      textAreaRef.current.value = '';
    }
  };
  
  const handleCancel = () => {
    resetAll();
    // Because the transaction is already saved, we refetch to correct the state.
    // A more robust solution might use a two-phase commit, but this is simpler.
     onTransactionSaved();
  }

  const isPending = isCategorizePending || isSaving;

  return (
    <div className="space-y-4">
      {!showConfirmation && (
        <form ref={categorizeFormRef} action={categorizeFormAction} className="space-y-4">
          <input type="hidden" name="userId" value={user?.uid || ''} />
          <Textarea
            ref={textAreaRef}
            name="transactionDetails"
            placeholder='e.g., "Groceries for ₹75.60 at Main St Market yesterday" or "Paycheck of ₹50000"'
            className="min-h-[80px]"
            required
            disabled={!user || isPending}
          />
          <AnalyzeButton />
           {!user && <p className="text-xs text-center text-destructive">Please sign in to add transactions.</p>}
        </form>
      )}

      {categorizeState.issues && !showConfirmation && (
         <Alert variant="destructive">
           <Terminal className="h-4 w-4" />
           <AlertTitle>Validation Error</AlertTitle>
           <AlertDescription>
             <ul>
              {categorizeState.issues.map((issue) => <li key={issue}>- {issue}</li>)}
             </ul>
           </AlertDescription>
         </Alert>
      )}

      {showConfirmation && categorizeState.data && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Confirm Transaction</CardTitle>
            <CardDescription>We've added this expense. Does this look correct?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description:</span>
              <span>{categorizeState.data.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">₹{categorizeState.data.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{format(new Date(categorizeState.data.date), 'PPP')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Category:</span>
              <Badge variant="outline">{categorizeState.data.category}</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>Undo</Button>
            <Button onClick={handleConfirm} disabled={isPending}>
                Looks Good
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
