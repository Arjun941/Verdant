
'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { handleUpdateProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

type BalanceDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentBalance?: number;
  currentDisplayName?: string;
};

const balanceSchema = z.object({
  balance: z.coerce.number().min(0, { message: 'Balance must be a positive number.' }),
});

export function BalanceDialog({ isOpen, onClose, onSuccess, currentBalance, currentDisplayName }: BalanceDialogProps) {
  const [user] = useAuthState(auth);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof balanceSchema>>({
    resolver: zodResolver(balanceSchema),
    defaultValues: {
      balance: currentBalance || 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        balance: currentBalance || 0,
      });
    }
  }, [isOpen, currentBalance, form]);

  async function onSubmit(values: z.infer<typeof balanceSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('balance', values.balance.toString());
    formData.append('userId', user.uid);
    // Pass displayName to satisfy the validation schema in the server action
    formData.append('displayName', currentDisplayName || user.displayName || 'User');


    startTransition(async () => {
      const result = await handleUpdateProfile(formData);
      if (result.success) {
        toast({ title: 'Success', description: 'Balance updated successfully.' });
        onSuccess();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Balance</DialogTitle>
          <DialogDescription>
            Update your current balance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Balance (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Balance'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
