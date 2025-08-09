'use server';

import { z } from 'zod';
import { addTransaction, deleteTransaction, updateUserProfile, updateTransaction, getUserProfile } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import { askVerdant } from '@/ai/flows/ask-verdant';
import { Insight, Transaction } from '@/lib/types';
import { bulkCategorizeTransactions } from '@/ai/flows/bulk-categorize-transactions';


const categorizeSchema = z.object({
  transactionDetails: z.string().min(5, {
    message: 'Please provide more details about the transaction.',
  }),
  userId: z.string(),
});

const transactionSchema = z.object({
  description: z.string().min(1, { message: 'Description is required.' }),
  amount: z.coerce.number().min(0.01, { message: 'Amount must be greater than 0.' }),
  date: z.string().min(1, { message: 'Date is required.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  userId: z.string(),
  transactionId: z.string().optional(),
});


const updateProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  photoDataUrl: z.string().optional(),
  balance: z.coerce.number().optional(),
});

const askVerdantSchema = z.object({
    question: z.string(),
    transactions: z.string().transform(str => JSON.parse(str)),
    insights: z.string().transform(str => JSON.parse(str)),
});

const bulkCategorizeSchema = z.object({
  bulkText: z.string().min(10, { message: 'Please provide more text to analyze.'}),
});

const bulkAddSchema = z.object({
    userId: z.string(),
    transactions: z.string().transform(str => JSON.parse(str)),
});

export type CategorizeFormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  data?: {
    isIncome: boolean;
    category: string;
    amount: number;
    date: string;
    description: string;
  };
};

export type TransactionFormState = {
  message: string;
  success: boolean;
};

export type UpdateProfileFormState = {
    message: string;
    success: boolean;
};

export async function handleCategorizeTransaction(
  prevState: CategorizeFormState,
  formData: FormData,
): Promise<CategorizeFormState> {
  const validatedFields = categorizeSchema.safeParse({
    transactionDetails: formData.get('transactionDetails'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    const { errors } = validatedFields.error;
    return {
      message: 'Validation error.',
      issues: errors.map((issue) => issue.message),
    };
  }
  
  const { transactionDetails, userId } = validatedFields.data;

  try {
    const result = await categorizeTransaction({ transactionDetails });
    const userProfile = await getUserProfile(userId);
    const currentBalance = userProfile?.balance || 0;
    
    let newBalance;
    let message;

    if (result.isIncome) {
      newBalance = currentBalance + result.amount;
      await updateUserProfile(userId, { balance: newBalance });
      message = `Income of ₹${result.amount.toFixed(2)} detected. Your balance has been updated to ₹${newBalance.toFixed(2)}.`;
    } else {
      // It's an expense, so we still add the transaction and update the balance
      await addTransaction(userId, {
        description: result.description,
        amount: result.amount,
        date: result.date,
        category: result.category,
      });
      newBalance = currentBalance - result.amount;
      await updateUserProfile(userId, { balance: newBalance });
      message = `Expense of ₹${result.amount.toFixed(2)} added. Your new balance is ₹${newBalance.toFixed(2)}.`;
    }
    
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard/transactions');

    // For expenses, we return the data to show confirmation, for income, it's just a toast.
    if (result.isIncome) {
        return { message };
    } else {
        return {
            message: 'Transaction categorized successfully.',
            data: result,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      message: `An error occurred while categorizing the transaction: ${errorMessage}`,
    };
  }
}

export async function handleAddTransaction(
  prevState: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const validatedFields = transactionSchema.safeParse({
    description: formData.get('description'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    category: formData.get('category'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid transaction data.',
      success: false,
    };
  }

  const { userId, description, amount, date, category } = validatedFields.data;

  try {
    // Add the transaction
    await addTransaction(userId, {
      description,
      amount,
      date,
      category,
    });
    
    // Update the balance
    const userProfile = await getUserProfile(userId);
    const currentBalance = userProfile?.balance || 0;
    const newBalance = currentBalance - amount;
    await updateUserProfile(userId, { balance: newBalance });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/transactions');

    return {
      message: 'Transaction added successfully.',
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `Error adding transaction: ${errorMessage}`,
      success: false,
    };
  }
}


export async function handleUpdateTransaction(
    prevState: TransactionFormState,
    formData: FormData,
  ): Promise<TransactionFormState> {
    const validatedFields = transactionSchema.safeParse({
      description: formData.get('description'),
      amount: formData.get('amount'),
      date: formData.get('date'),
      category: formData.get('category'),
      userId: formData.get('userId'),
      transactionId: formData.get('transactionId'),
    });
  
    if (!validatedFields.success || !validatedFields.data.transactionId) {
      return {
        message: 'Invalid transaction data.',
        success: false,
      };
    }
  
    try {
      await updateTransaction(validatedFields.data.userId, validatedFields.data.transactionId, {
        description: validatedFields.data.description,
        amount: validatedFields.data.amount,
        date: validatedFields.data.date,
        category: validatedFields.data.category,
      });
      
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/transactions');
  
      return {
        message: 'Transaction updated successfully.',
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return {
        message: `Error updating transaction: ${errorMessage}`,
        success: false,
      };
    }
  }
  
  export async function handleDeleteTransaction(userId: string, transactionId: string): Promise<{success: boolean, message: string}> {
    if (!userId || !transactionId) {
      return { success: false, message: 'Invalid user or transaction ID.' };
    }
  
    try {
      await deleteTransaction(userId, transactionId);
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/transactions');
      return { success: true, message: 'Transaction deleted.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, message: `Error deleting transaction: ${message}` };
    }
  }

export async function handleUpdateProfile(formData: FormData): Promise<UpdateProfileFormState> {
  const validatedFields = updateProfileSchema.safeParse({
    userId: formData.get('userId'),
    displayName: formData.get('displayName'),
    photoDataUrl: formData.get('photoDataUrl'),
    balance: formData.get('balance') || undefined,
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten());
    return { success: false, message: "Invalid data provided." };
  }
  
  const { userId, displayName, photoDataUrl, balance } = validatedFields.data;

  try {
    await updateUserProfile(userId, {
      displayName,
      ...(photoDataUrl && { photoURL: photoDataUrl }),
      ...(balance !== undefined && { balance }),
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');

    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message };
  }
}


export async function handleAskVerdant(
  prevState: any,
  formData: FormData,
): Promise<{ answer: string; error?: string }> {
  const validatedFields = askVerdantSchema.safeParse({
    question: formData.get('question'),
    transactions: formData.get('transactions'),
    insights: formData.get('insights'),
  });

  if (!validatedFields.success) {
    return {
      answer: '',
      error: 'Invalid form data provided.',
    };
  }

  try {
    const result = await askVerdant(validatedFields.data);
    return { answer: result.answer };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { answer: '', error: `An error occurred: ${message}` };
  }
}


export async function handleBulkCategorize(prevState: any, formData: FormData) {
    const validated = bulkCategorizeSchema.safeParse({
        bulkText: formData.get('bulkText'),
    });

    if (!validated.success) {
        return { success: false, data: null, message: validated.error.flatten().fieldErrors.bulkText?.[0] };
    }

    try {
        const result = await bulkCategorizeTransactions({ bulkText: validated.data.bulkText });
        return { success: true, data: result.transactions, message: '' };
    } catch (e) {
        const message = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return { success: false, data: null, message };
    }
}

export async function handleAddBulkTransactions(prevState: any, formData: FormData) {
    const validated = bulkAddSchema.safeParse({
        userId: formData.get('userId'),
        transactions: formData.get('transactions'),
    });

    if (!validated.success) {
        return { success: false, message: 'Invalid data provided.' };
    }

    const { userId, transactions } = validated.data;
    let totalIncome = 0;
    let totalExpense = 0;

    try {
        for (const transaction of transactions) {
            await addTransaction(userId, {
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date,
                category: transaction.category,
            });
            if (transaction.isIncome) {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        }
        
        const userProfile = await getUserProfile(userId);
        const currentBalance = userProfile?.balance || 0;
        const newBalance = currentBalance + totalIncome - totalExpense;
        await updateUserProfile(userId, { balance: newBalance });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/transactions');

        return { success: true, message: `${transactions.length} transactions added successfully.` };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message };
    }
}
