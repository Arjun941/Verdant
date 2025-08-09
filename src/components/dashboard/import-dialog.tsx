
'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useActionState, useEffect, useState, useTransition, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { handleBulkCategorize, handleAddBulkTransactions } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '../ui/textarea';
import { FileUp, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

type ImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type AiTransaction = {
    isIncome: boolean;
    category: string;
    amount: number;
    date: string;
    description: string;
}

enum Stage {
    Upload,
    Review,
    Saving,
}

export function ImportDialog({ isOpen, onClose, onSuccess }: ImportDialogProps) {
    const [user] = useAuthState(auth);
    const { toast } = useToast();

    const [stage, setStage] = useState<Stage>(Stage.Upload);
    const [bulkText, setBulkText] = useState('');
    const [fileName, setFileName] = useState('');
    
    const [isCategorizePending, startCategorizeTransition] = useTransition();
    const [isAddPending, startAddTransition] = useTransition();


    const [categorizeState, categorizeAction] = useActionState(handleBulkCategorize, { success: false, data: null, message: '' });
    const [addState, addAction] = useActionState(handleAddBulkTransactions, { success: false, message: '' });
    
    const [parsedTransactions, setParsedTransactions] = useState<AiTransaction[]>([]);

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setStage(Stage.Upload);
            setBulkText('');
            setFileName('');
            setParsedTransactions([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (categorizeState.success && categorizeState.data) {
            setParsedTransactions(categorizeState.data);
            setStage(Stage.Review);
        } else if (categorizeState.message) {
            toast({
                title: 'Analysis Error',
                description: categorizeState.message,
                variant: 'destructive'
            });
        }
    }, [categorizeState, toast]);

     useEffect(() => {
        if (stage === Stage.Saving && addState.message) {
            if (addState.success) {
                toast({
                    title: 'Success',
                    description: addState.message
                });
                onSuccess();
            } else {
                 toast({
                    title: 'Save Error',
                    description: addState.message,
                    variant: 'destructive'
                });
                setStage(Stage.Review); // Go back to review stage on error
            }
        }
    }, [addState, stage, toast, onSuccess]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            Papa.parse(file, {
                complete: (result) => {
                    const text = result.data.map(row => (row as string[]).join(', ')).join('\n');
                    setBulkText(text);
                },
                error: (error) => {
                    toast({ title: 'CSV Parse Error', description: error.message, variant: 'destructive'});
                }
            });
        }
    };
    
    const handleAnalyze = () => {
        if (!bulkText) {
            toast({ description: "Please provide some text or a CSV file.", variant: "destructive" });
            return;
        }
        const formData = new FormData();
        formData.append('bulkText', bulkText);
        startCategorizeTransition(() => {
            categorizeAction(formData);
        });
    };
    
    const handleSave = () => {
        setStage(Stage.Saving);
        const formData = new FormData();
        formData.append('userId', user!.uid);
        formData.append('transactions', JSON.stringify(parsedTransactions));
        startAddTransition(() => {
             addAction(formData);
        });
    }
    
    const handleTransactionChange = (index: number, field: keyof AiTransaction, value: any) => {
        const updated = [...parsedTransactions];
        (updated[index] as any)[field] = value;
        setParsedTransactions(updated);
    }

    const isPending = isCategorizePending || isAddPending;

    const renderUploadStage = () => (
        <Fragment>
            <DialogHeader>
                <DialogTitle>Import Transactions</DialogTitle>
                <DialogDescription>
                    Upload a CSV file or paste bulk transaction text to be categorized by AI.
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="paste" className="py-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                    <TabsTrigger value="csv">Upload CSV</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="mt-4">
                     <Textarea
                        placeholder="Paste your transaction data here. One transaction per line is best."
                        className="min-h-[200px]"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        disabled={isPending}
                    />
                </TabsContent>
                 <TabsContent value="csv" className="mt-4">
                    <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">CSV file</p>
                            {fileName && <p className="text-xs text-primary mt-2">{fileName}</p>}
                        </div>
                        <Input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={isPending}/>
                    </label>
                </TabsContent>
            </Tabs>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={handleAnalyze} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Analyze
                </Button>
            </DialogFooter>
        </Fragment>
    );
    
    const renderReviewStage = () => (
         <Fragment>
            <DialogHeader>
                <DialogTitle>Review Transactions</DialogTitle>
                <DialogDescription>
                    Review and edit the transactions identified by the AI.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[50vh] overflow-y-auto pr-2">
                <Table>
                    <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parsedTransactions.map((t, i) => (
                            <TableRow key={i}>
                                <TableCell><Input value={t.description} onChange={e => handleTransactionChange(i, 'description', e.target.value)} /></TableCell>
                                <TableCell><Input type="number" value={t.amount} onChange={e => handleTransactionChange(i, 'amount', parseFloat(e.target.value))} /></TableCell>
                                <TableCell><Input value={t.category} onChange={e => handleTransactionChange(i, 'category', e.target.value)} /></TableCell>
                                <TableCell><Input value={format(new Date(t.date), 'yyyy-MM-dd')} onChange={e => handleTransactionChange(i, 'date', e.target.value)} /></TableCell>
                                <TableCell>
                                    <Badge variant={t.isIncome ? 'default' : 'secondary'}>
                                        {t.isIncome ? 'Income' : 'Expense'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setStage(Stage.Upload)} disabled={isPending}>Back</Button>
                <Button onClick={handleSave} disabled={isPending}>
                     {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save {parsedTransactions.length} Transactions
                </Button>
            </DialogFooter>
         </Fragment>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
               {stage === Stage.Upload && renderUploadStage()}
               {stage === Stage.Review && renderReviewStage()}
               {stage === Stage.Saving && (
                 <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Saving transactions...</p>
                 </div>
               )}
            </DialogContent>
        </Dialog>
    );
}
