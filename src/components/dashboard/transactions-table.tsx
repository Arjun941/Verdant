import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatDateInTimezone } from '@/lib/timezone';
import { getUserProfile } from '@/lib/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { motion } from 'framer-motion';

type TransactionsTableProps = {
  transactions: Transaction[];
  showPagination?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
};

export default function TransactionsTable({ 
  transactions, 
  showPagination = true,
  onEdit,
  onDelete
}: TransactionsTableProps) {
  const [user] = useAuthState(auth);
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  
  // Get user's timezone for proper date formatting
  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((profile) => {
        if (profile?.timezone) {
          setUserTimezone(profile.timezone);
        }
      });
    }
  }, [user]);
  const getCategoryBadgeVariant = (category: Transaction['category']) => {
    switch (category) {
      case 'Groceries': return 'default';
      case 'Utilities': return 'secondary';
      case 'Entertainment': return 'outline';
      case 'Income': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="transition-all duration-300 hover:shadow-lg border-border/50 hover:border-border">
        <CardHeader className="px-4 sm:px-7">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>A list of your recent transactions.</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-7">
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] text-left">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right min-w-[80px]">Amount</TableHead>
                   {(onEdit || onDelete) && <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No transactions found.</TableCell>
                  </TableRow>
              )}
              {transactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300 
                  }}
                  className="group hover:bg-muted/50 transition-colors duration-200"
                  style={{ display: 'table-row' }}
                >
                  <TableCell>
                    <div className="font-medium">{transaction.description}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Badge className="text-xs" variant={getCategoryBadgeVariant(transaction.category)}>
                        {transaction.category}
                      </Badge>
                    </motion.div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDateInTimezone(transaction.date, userTimezone, 'PPp')}</TableCell>
                  <TableCell className={`text-right font-semibold ${transaction.amount < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount).toFixed(2)}
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && <DropdownMenuItem onClick={() => onEdit(transaction)}>Edit</DropdownMenuItem>}
                          {onDelete && <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-destructive">Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          </div>
          {showPagination && (
            <motion.div 
              className="flex items-center justify-center space-x-2 py-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                Next
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
