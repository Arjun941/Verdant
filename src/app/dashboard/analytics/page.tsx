'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IndianRupee, CreditCard, Activity, Pencil } from 'lucide-react';
import { getTransactions, getUserProfile } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { redirect } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Transaction, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, LineChart, PieChart, Pie, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AnalyticsPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const userTransactions = await getTransactions(user.uid);
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      redirect('/login');
    } else {
      fetchTransactions();
    }
  }, [user, loadingAuth, fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const fromDate = dateRange?.from;
      const toDate = dateRange?.to;
      
      if (!fromDate || !toDate) return true;
      
      return transactionDate >= fromDate && transactionDate <= toDate;
    });
  }, [transactions, dateRange]);


  const spendingByCategory = useMemo(() => {
    const data = filteredTransactions.reduce((acc, t) => {
        if (t.amount > 0) {
            const category = t.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += t.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);
  
  const spendingOverTime = useMemo(() => {
     const data = filteredTransactions
      .filter(t => t.amount > 0)
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce((acc, t) => {
        const date = format(new Date(t.date), 'yyyy-MM-dd');
        const existingEntry = acc.find(entry => entry.date === date);
        if (existingEntry) {
            existingEntry.total += t.amount;
        } else {
            acc.push({ date, total: t.amount });
        }
        return acc;
     }, [] as {date: string; total: number}[]);

     return data;
  }, [filteredTransactions]);


  if (loadingAuth || loadingData) {
    return (
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-9 w-[280px]" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Spending Analytics</h1>
                <p className="text-muted-foreground">Visualize your financial habits.</p>
            </div>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[300px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
            </Popover>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                    <CardDescription>How your spending is distributed across categories.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    {spendingByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={spendingByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs fill-primary-foreground">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            >
                            {spendingByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `₹${value.toFixed(2)}`}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                }}
                            />
                            <Legend iconSize={10} />
                        </PieChart>
                    </ResponsiveContainer>
                    ) : <div className="flex items-center justify-center h-full text-muted-foreground">No spending data for this period.</div>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Spending Over Time</CardTitle>
                    <CardDescription>Your total daily spending for the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    {spendingOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={spendingOverTime}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                            <XAxis dataKey="date" tickFormatter={(str) => format(new Date(str), 'MMM d')} angle={-45} textAnchor="end" height={60} />
                            <YAxis tickFormatter={(value) => `₹${value}`} />
                            <Tooltip 
                                 formatter={(value: number) => `₹${value.toFixed(2)}`}
                                 contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                }}
                                labelFormatter={(label) => format(new Date(label), 'PPP')}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="total" name="Total Spending" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, strokeWidth: 2}} />
                        </LineChart>
                    </ResponsiveContainer>
                     ) : <div className="flex items-center justify-center h-full text-muted-foreground">No spending data for this period.</div>}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
