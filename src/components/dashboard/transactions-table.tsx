import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

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
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Transactions</CardTitle>
        <CardDescription>A list of your recent transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
               {(onEdit || onDelete) && <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">No transactions found.</TableCell>
              </TableRow>
            )}
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="font-medium">{transaction.description}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant={getCategoryBadgeVariant(transaction.category)}>
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{format(new Date(transaction.date), 'PPp')}</TableCell>
                <TableCell className={`text-right ${transaction.amount < 0 ? 'text-destructive' : ''}`}>
                  ₹{Math.abs(transaction.amount).toFixed(2)}
                </TableCell>
                {(onEdit || onDelete) && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showPagination && (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Button variant="outline" size="sm" >
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
