
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
import { FileUp, Loader2, Brain, CheckCircle2, Upload, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
            // Clear everything when dialog closes
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

    // Animation variants
    const stageVariants = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    const loadingVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: { 
            scale: 1, 
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        exit: { scale: 0.8, opacity: 0 }
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const spinVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const renderAnalyzingAnimation = () => (
        <motion.div
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center gap-6 py-16"
        >
            <div className="relative">
                <motion.div
                    variants={spinVariants}
                    animate="animate"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-xl"
                />
                <motion.div
                    variants={pulseVariants}
                    animate="animate"
                    className="relative bg-background border-2 border-primary/20 rounded-full p-6"
                >
                    <Brain className="h-12 w-12 text-primary" />
                </motion.div>
            </div>
            
            <div className="text-center space-y-2">
                <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-semibold"
                >
                    AI is analyzing your transactions
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground"
                >
                    This usually takes a few seconds...
                </motion.p>
            </div>

            <motion.div
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-1 bg-gradient-to-r from-primary to-accent rounded-full"
            />
        </motion.div>
    );

    const renderSavingAnimation = () => (
        <motion.div
            variants={loadingVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center gap-6 py-16"
        >
            <div className="relative">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="bg-accent/10 rounded-full p-6"
                >
                    <Upload className="h-12 w-12 text-accent" />
                </motion.div>
                
                {/* Floating particles */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-accent/60 rounded-full"
                        initial={{ 
                            x: 0, 
                            y: 0, 
                            opacity: 0 
                        }}
                        animate={{
                            x: [0, 30 + i * 10, 0],
                            y: [0, -40 - i * 10, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                        }}
                        style={{
                            left: '50%',
                            top: '50%',
                        }}
                    />
                ))}
            </div>
            
            <div className="text-center space-y-2">
                <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-semibold"
                >
                    Saving transactions
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground"
                >
                    Adding {parsedTransactions.length} transactions to your account...
                </motion.p>
            </div>

            <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-accent rounded-full"
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    );

    const renderUploadStage = () => (
        <motion.div
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Import Transactions
                </DialogTitle>
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Textarea
                            placeholder="Paste your transaction data here. One transaction per line is best."
                            className="min-h-[200px]"
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            disabled={isPending}
                        />
                    </motion.div>
                </TabsContent>
                <TabsContent value="csv" className="mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                            <motion.div 
                                className="flex flex-col items-center justify-center pt-5 pb-6"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            >
                                <motion.div
                                    animate={fileName ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.5 }}
                                >
                                    <FileUp className={`w-10 h-10 mb-3 ${fileName ? 'text-primary' : 'text-muted-foreground'}`} />
                                </motion.div>
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">CSV file</p>
                                <AnimatePresence>
                                    {fileName && (
                                        <motion.p
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="text-xs text-primary mt-2 flex items-center gap-1"
                                        >
                                            <CheckCircle2 className="h-3 w-3" />
                                            {fileName}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                            <Input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} disabled={isPending}/>
                        </label>
                    </motion.div>
                </TabsContent>
            </Tabs>
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleAnalyze} disabled={isPending || !bulkText}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Brain className="mr-2 h-4 w-4" />
                                Analyze
                            </>
                        )}
                    </Button>
                </motion.div>
            </DialogFooter>
        </motion.div>
    );
    
    const renderReviewStage = () => (
        <motion.div
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    Review Transactions
                </DialogTitle>
                <DialogDescription>
                    Review and edit the transactions identified by the AI.
                </DialogDescription>
            </DialogHeader>
            <motion.div 
                className="max-h-[50vh] overflow-y-auto pr-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
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
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.3 }}
                                className="border-b transition-colors hover:bg-muted/50"
                            >
                                <TableCell><Input value={t.description} onChange={e => handleTransactionChange(i, 'description', e.target.value)} /></TableCell>
                                <TableCell><Input type="number" value={t.amount} onChange={e => handleTransactionChange(i, 'amount', parseFloat(e.target.value))} /></TableCell>
                                <TableCell><Input value={t.category} onChange={e => handleTransactionChange(i, 'category', e.target.value)} /></TableCell>
                                <TableCell><Input value={format(new Date(t.date), 'yyyy-MM-dd')} onChange={e => handleTransactionChange(i, 'date', e.target.value)} /></TableCell>
                                <TableCell>
                                    <Badge variant={t.isIncome ? 'default' : 'secondary'}>
                                        {t.isIncome ? 'Income' : 'Expense'}
                                    </Badge>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </motion.div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStage(Stage.Upload)} disabled={isPending}>Back</Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Save {parsedTransactions.length} Transactions
                            </>
                        )}
                    </Button>
                </motion.div>
            </DialogFooter>
        </motion.div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                <AnimatePresence mode="wait">
                    {stage === Stage.Upload && !isCategorizePending && (
                        <motion.div key="upload">
                            {renderUploadStage()}
                        </motion.div>
                    )}
                    
                    {isCategorizePending && (
                        <motion.div key="analyzing">
                            {renderAnalyzingAnimation()}
                        </motion.div>
                    )}
                    
                    {stage === Stage.Review && !isAddPending && (
                        <motion.div key="review">
                            {renderReviewStage()}
                        </motion.div>
                    )}
                    
                    {(stage === Stage.Saving || isAddPending) && (
                        <motion.div key="saving">
                            {renderSavingAnimation()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
